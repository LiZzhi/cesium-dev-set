import { Viewer, Cartesian3, Particle} from "cesium";
import particleSystemBase from "./particleSystemBase";

export type smokeUpdateType = {
    startScale?: number,
    endScale?: number,
    minimumParticleLife?: number,
    maximumParticleLife?: number,
    minimumSpeed?: number,
    maximumSpeed?: number,
    emissionRate?: number,
    gravity?: number,
    pitch?: number;
    heading?: number;
}

export type smokeInitialype = smokeUpdateType & {
    image?: string,
    particleSize?: number;
}

export default class smokeParticle extends particleSystemBase{
    #style: smokeInitialype;
    /**
     * @description: 烟雾粒子效果
     * @param {Viewer} viewer viewer
     * @param {Cartesian3} position 位置，注意设置高度，无贴地属性
     * @param {smokeStyleType} style (可选)一些属性
     * @return {*}
     */
    constructor(viewer: Viewer, position: Cartesian3, style: smokeInitialype = {}){
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
     * @return { smokeInitialype }
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
     * @return { smokeInitialype }
     */
    get defaultStyle():smokeInitialype {
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