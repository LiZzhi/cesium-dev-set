import { Viewer, Cartesian3, Particle} from "cesium";
import particleSystemBase from "./particleSystemBase";

export type smokeUpdateType = {
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
}

export type smokeInitialType = smokeUpdateType & {
    image?: string, // 图像
    particleSize?: number;  // 横纵尺寸
}

export default class smokeParticle extends particleSystemBase{
    #style: smokeInitialType;
    /**
     * @description: 烟雾粒子效果
     * @param {Viewer} viewer viewer
     * @param {Cartesian3} position 位置，注意设置高度，无贴地属性
     * @param {smokeStyleType} style (可选)一些属性
     * @return {*}
     */
    constructor(viewer: Viewer, position: Cartesian3, style: smokeInitialType = {}){
        super(viewer, position);
        this.#style = Object.assign(this.defaultStyle, style);
    }

    /**
     * @description: 创建
     * @param {boolean} show (可选)可见性，默认为true
     * @return {*}
     */
    init(show: boolean = true){
        this.particleSystem = this.#createParticleSystem();
        this.viewer.scene.primitives.add(this.particleSystem);
        this.viewer.scene.preUpdate.addEventListener(this.preUpdateEvent(this.#style), this);
        this.isStart = true;
        this.setVisible(show);
    }

    /**
     * @description: 销毁，销毁后不应再调用
     * @return {*}
     */
    destroy(){
        return super.destroy();
    }

    /**
     * @description: 获取当前粒子属性
     * @return { smokeInitialType }
     */
    get style(){
        return this.#style;
    }

    /**
     * @description: 更新样式
     * @param {smokeUpdateType} style 要更新的样式
     * @return {*}
     */
    set style(style: smokeUpdateType){
        let i: keyof smokeUpdateType;
        for (i in style) {
            if(i === "gravity"){
                this.particleSystem.updateCallback = (particle: Particle, dt: number) => {
                    return this.applyGravity(particle, dt, style.gravity!);
                };
            } else if(i !== "pitch" && i !== "heading") {
                this.particleSystem[i] = style[i]!;
            }
            this.#style[i] = style[i]
        }
    }

    /**
     * @description: 创建粒子对象
     * @return {smokeStyleType}
     */
    #createParticleSystem() {
        return new Cesium.ParticleSystem({
            show: this.visible,
            image: this.#style.image,
            startColor: new Cesium.Color(0, 0, 0, 0.6),
            endColor: new Cesium.Color(0, 0, 0, 0.8),
            startScale: this.#style.startScale,
            endScale: this.#style.endScale,
            minimumParticleLife: this.#style.minimumParticleLife,
            maximumParticleLife: this.#style.maximumParticleLife,
            minimumSpeed: this.#style.minimumSpeed,
            maximumSpeed: this.#style.maximumSpeed,
            imageSize: new Cesium.Cartesian2(
                this.#style.particleSize,
                this.#style.particleSize
            ),
            emissionRate: this.#style.emissionRate,
            lifetime: 16.0,
            //粒子发射器
            emitter: new Cesium.CircleEmitter(0.2),
            updateCallback: (particle: Particle, dt: number) => {
                return this.applyGravity(particle, dt, this.#style.gravity!);
            },
            sizeInMeters: true,
            // performance: false
        });
    }

    /**
     * @description: 默认样式
     * @return { smokeInitialType }
     */
    get defaultStyle():smokeInitialType {
        return {
            image: require("../../assets/img/smokeParticle/smoke.png"),
            emissionRate: 40.0,
            gravity: -0.54,
            minimumParticleLife: 5,
            maximumParticleLife: 5,
            minimumSpeed: 9,
            maximumSpeed: 9.5,
            startScale: 1,
            endScale: 7,
            particleSize: 1,
            heading: 180,
            pitch: 315
        };
    }
}