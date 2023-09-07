import {
    Viewer,
    Entity,
    EntityCollection,
    CustomDataSource,
    ParticleSystem,
    Matrix4,
    Cartesian3,
    Quaternion,
    HeadingPitchRoll,
    TranslationRotationScale,
    JulianDate,
    Scene,
    Particle,
} from "cesium";
import type { voidFuncType } from "@/type/common";

export type particleStyleType = {
    image?: string, // 图像
    particleSize?: number;  // 横纵尺寸
    startScale?: number,    // 在粒子寿命开始时应用于粒子图像的初始比例。
    endScale?: number,  // 在粒子寿命结束时应用于粒子图像的最终比例。
    minimumParticleLife?: number,   // 设置以秒为单位的粒子生命的可能持续时间的最小范围，在该时间范围内可以随机选择粒子的实际生命。
    maximumParticleLife?: number,   // 设置粒子寿命的可能持续时间的最大限制（以秒为单位），在该范围内将随机选择粒子的实际寿命。
    minimumSpeed?: number,  // 设置以米/秒为单位的最小界限，高于该界限时，将随机选择粒子的实际速度。
    maximumSpeed?: number,  // 设置以米/秒为单位的最大范围，在该范围内将随机选择粒子的实际速度。
    emissionRate?: number,  // 每秒要发射的粒子数。
    gravity?: number,   // 重力大小
    pitch?: number; // 方向，航向角
    heading?: number;   // 方向，倾斜角
};

export default class particleSystemBase {
    readonly viewer: Viewer;
    protected entity: Entity;
    protected particleSystemCollection: CustomDataSource;
    protected particleSystem: ParticleSystem;
    protected emitterModelMatrix: Matrix4;
    protected translation: Cartesian3;
    protected rotation: Quaternion;
    protected hpr: HeadingPitchRoll;
    protected trs: TranslationRotationScale;
    protected preUpdateEventFunc: voidFuncType;
    protected gravityScratch: Cartesian3;
    protected isStart: boolean;
    protected isDestroy: boolean;
    protected visible: boolean;

    /**
     * @description: 粒子系统基类，用于继承，不应实例化
     * @param {Cesium.Viewer} viewer
     * @param {Cesium.Cartesian3} position
     * @return {*}
     */
    constructor(viewer: Viewer, position: Cartesian3) {
        this.viewer = viewer;
        // 通过entity控制位置
        this.entity = new Cesium.Entity({
            position,
            show: false,
        });
        let particleSystemSource = this.viewer.dataSources.getByName(
            "particleSystemSource"
        );
        if (particleSystemSource.length) {
            this.particleSystemCollection = particleSystemSource[0];
        } else {
            this.particleSystemCollection = new Cesium.CustomDataSource(
                "particleSystemSource"
            );
            this.viewer.dataSources.add(this.particleSystemCollection);
        }
        this.particleSystemCollection.entities.add(this.entity);
        console.log(this.particleSystemCollection.entities);
        // 粒子
        this.particleSystem = new Cesium.ParticleSystem();
        // 方位属性
        this.emitterModelMatrix = new Cesium.Matrix4();
        this.translation = new Cesium.Cartesian3();
        this.rotation = new Cesium.Quaternion();
        this.hpr = new Cesium.HeadingPitchRoll();
        this.trs = new Cesium.TranslationRotationScale();
        // 更新事件,用于后续移除
        this.preUpdateEventFunc = () => {};
        // 重力方向
        this.gravityScratch = new Cesium.Cartesian3();
        this.entity.entityCollection.collectionChanged.addEventListener(
            this.#entityChangedEvent, this
        );
        // 是否创建或销毁
        this.isStart = false;
        this.isDestroy = false;
        // 是否可见
        this.visible = false;
    }

    /**
     * @description: 设置可见性
     * @param {boolean} show 是否可见
     * @return {*}
     */
    setVisible(show: boolean) {
        this.particleSystem.show = show;
        this.visible = show;
    }

    /**
     * @description: 获取可见性
     * @return {*}
     */
    getVisible() {
        return this.visible;
    }

    /**
     * @description: 公用销毁
     * @return {*}
     */
    protected destroy() {
        if (this.isStart && !this.isDestroy) {
            this.#removeEvent(); //清除事件
            this.viewer.scene.primitives.remove(this.particleSystem); //删除粒子对象
            this.particleSystemCollection.entities.remove(this.entity); //删除entity
            this.isStart = false;
            this.isDestroy = true;
            return true;
        } else {
            console.log("未创建或已经销毁");
            return false;
        }
    }

    /**
     * @description:
     * @param {particleStyleType} style 粒子的 particleStyleType
     * @param {eventFuncType} callBack 回调函数,每次更新都会执行
     * @return {*}
     */
    protected preUpdateEvent(
        style: particleStyleType,
        callBack?: voidFuncType
    ) {
        this.preUpdateEventFunc = (scene: Scene, time: JulianDate) => {
            this.particleSystem.modelMatrix = this.entity.computeModelMatrix(
                time,
                new Cesium.Matrix4()
            );
            this.hpr = Cesium.HeadingPitchRoll.fromDegrees(
                style.heading!,
                style.pitch!,
                0.0,
                this.hpr
            );
            this.trs.translation = Cesium.Cartesian3.fromElements(
                0,
                0,
                0,
                this.translation
            );
            this.trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(
                this.hpr,
                this.rotation
            );
            this.particleSystem.emitterModelMatrix =
                Cesium.Matrix4.fromTranslationRotationScale(
                    this.trs,
                    this.emitterModelMatrix
                );
            typeof callBack === "function" && callBack();
        };
        return this.preUpdateEventFunc;
    }

    /**
     * @description: 重力 计算局部向上量
     * @return {*}
     */
    protected applyGravity(
        particle: Particle,
        dt: number,
        gravity: number
    ) {
        // We need to compute a local up vector for each particle in geocentric space.
        Cesium.Cartesian3.normalize(particle.position, this.gravityScratch);
        Cesium.Cartesian3.multiplyByScalar(
            this.gravityScratch,
            gravity * dt,
            this.gravityScratch
        );
        Cesium.Cartesian3.add(
            particle.velocity,
            this.gravityScratch,
            particle.velocity
        );
    }

    /**
     * @description: 销毁事件
     * @return {*}
     */
    #removeEvent() {
        this.entity.entityCollection.collectionChanged.removeEventListener(
            this.#entityChangedEvent, this
        );
        this.viewer.scene.preUpdate.removeEventListener(
            this.preUpdateEventFunc,
            this
        );
        this.emitterModelMatrix = new Cesium.Matrix4();
        this.translation = new Cesium.Cartesian3();
        this.rotation = new Cesium.Quaternion();
        this.hpr = new Cesium.HeadingPitchRoll();
        this.trs = new Cesium.TranslationRotationScale();
    }

    /**
     * @description: 移除entity即触发destroy
     * @param {EntityCollection} e
     * @return {*}
     */
    #entityChangedEvent(e: EntityCollection){
        if (this.isStart && !this.isDestroy) {
            let entity = e.values.find( v => v.id === this.entity.id);
            if (entity === undefined) {
                this.destroy();
            }
        }
    }
}
