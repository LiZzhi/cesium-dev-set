import { Viewer, Cartesian3} from "cesium";
import particleSystemBase from "./particleSystemBase";

export type fireStyleType = {
    image?: string,
    startScale?: number,
    endScale?: number,
    minimumParticleLife?: number,
    maximumParticleLife?: number,
    minimumSpeed?: number,
    maximumSpeed?: number,
    particleSize?: number;
    emissionRate?: number,
    pitch?: number;
    heading?: number;
}

export default class fireParticle extends particleSystemBase {
    #style: fireStyleType;
    /**
     * @description: 火焰粒子效果
     * @param {Viewer} viewer viewer
     * @param {Cartesian3} position 位置，注意设置高度，无贴地属性
     * @param {particleStyleType} style (可选)一些属性
     * @return {*}
     */
    constructor(
        viewer: Viewer,
        position: Cartesian3,
        style: fireStyleType = {}
    ) {
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
    destroy() {
        return super.destroy();
    }

    /**
     * @description: 获取当前粒子属性
     * @return {fireStyleType}
     */
    get style(){
        return this.#style;
    }

    /**
     * @description: 更新样式
     * @param {fireStyleType} style 要更新的样式
     * @return {*}
     */
    set style(style: fireStyleType){
        for (let i in style) {
            if (i === "imageSize") {
                // @ts-ignore
                this.particleSystem.imageSize = style.particleSize
                    ? new Cesium.Cartesian2(
                            style.particleSize,
                            style.particleSize
                    ) : new Cesium.Cartesian2(
                            this.#style.particleSize,
                            this.#style.particleSize
                    );
            } else {
                // @ts-ignore
                this.particleSystem[i] = style[i];
            }
        }
    }

    /**
     * @description: 创建粒子对象
     * @return {ParticleSystem}
     */
    #createParticleSystem() {
        return new Cesium.ParticleSystem({
            show: this.visible,
            image: this.#style.image,
            startColor: new Cesium.Color(1, 1, 1, 1),
            endColor: new Cesium.Color(0.5, 0, 0, 0),
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
            loop: true,
            emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)),
            sizeInMeters: true
        });
    }

    /**
     * @description: 默认样式
     * @return {fireStyleType}
     */
    get defaultStyle(): fireStyleType {
        return {
            image: require("../../assets/img/fireParticle/fire.png"),
            startScale: 3,
            endScale: 1.5,
            minimumParticleLife: 1.5,
            maximumParticleLife: 1.8,
            minimumSpeed: 7,
            maximumSpeed: 9,
            particleSize: 2,
            emissionRate: 200,
            heading: 0.0,
            pitch: 0.0,
        };
    }
}
