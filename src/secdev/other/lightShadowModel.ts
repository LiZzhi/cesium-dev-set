/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-26 10:42:41
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2025-01-15 17:31:04
 * @FilePath: \cesium-secdev-set\src\secdev\other\lightShadowModel.ts
 * @Description: 光影模型特效
 */
import {
    Viewer,
    Color,
    Cesium3DTileset,
    PrimitiveCollection,
    MaterialAppearance,
    ClassificationType,
    GroundPrimitive,
} from "cesium";
import diffusedAppearance from "../specialEffectPlot/polygon/diffusedAppearance";
import type { voidFuncType } from "@/type/common";

export type lightShadowModelOptionType = {
    maxHeight: number; // 渐变最大高度
    offset: number; // 颜色纵向位移
    color: Color; // 主色
    openDiffuse: boolean; // 是否开启扩散
    location: boolean; // 是否定位
    classificationType: ClassificationType; // 扩散波的classificationType，开启扩散波才有效
};

type diffuseType = {
    primitive?: GroundPrimitive;
    removeUpdate?: voidFuncType;
};

export default class {
    option: lightShadowModelOptionType;
    viewer: Viewer;
    tileset: Cesium3DTileset;
    collection: PrimitiveCollection;
    diffuse: diffuseType;
    /**
     * 光影模型特效
     * @param viewer viewer
     * @param url 模型地址
     * @param option 参数
     */
    constructor(
        viewer: Viewer,
        url: string,
        option: Partial<lightShadowModelOptionType> = {}
    ) {
        this.viewer = viewer;
        this.option = Object.assign(
            {
                maxHeight: 30,
                offset: 0,
                color: Cesium.Color.fromCssColorString(
                    "rgba(0, 112, 250, 0.5)"
                ),
                openDiffuse: true,
                location: false,
                classificationType: Cesium.ClassificationType.TERRAIN,
            },
            option
        );
        // 不开启无法自定义shader
        Cesium.ExperimentalFeatures.enableModelExperimental = true;

        this.collection = new Cesium.PrimitiveCollection({
            destroyPrimitives: false,
        });
        viewer.scene.primitives.add(this.collection);

        this.tileset = new Cesium.Cesium3DTileset({
            url: url,
        });
        this.diffuse = {};
        this.add();
    }

    /**
     * 重新添加至地图
     */
    add() {
        this.remove();

        let model = this.collection.add(this.tileset);
        model.readyPromise.then(() => {
            this.tileset.customShader = this.createShader();
            if (this.option.location) {
                this.viewer.flyTo(model);
            }
            this.diffuse = this.createDiffuse();
        });
    }

    /**
     * 从地图中移除
     */
    remove() {
        this.collection.removeAll();
        if (this.diffuse?.removeUpdate) {
            this.diffuse.removeUpdate();
        }
        this.diffuse = {};
    }

    /**
     * 修改扩散波显隐
     */
    changeDiffuseShow(show: boolean) {
        if (this.diffuse?.primitive) {
            this.diffuse.primitive.show = show;
        }
    }

    /**
     * 创建customShader
     * @returns
     */
    createShader() {
        Cesium.ExperimentalFeatures.enableModelExperimental = true;
        return new Cesium.CustomShader({
            //外部传给顶点着色器或者片元着色器
            uniforms: {
                u_maxHeight: {
                    type: Cesium.UniformType.FLOAT,
                    value: this.option.maxHeight,
                },
                u_offsetHeight: {
                    type: Cesium.UniformType.FLOAT,
                    value: this.option.offset,
                },
                u_Color: {
                    type: Cesium.UniformType.VEC4,
                    value: this.option.color,
                },
            },
            fragmentShaderText: `
                void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                    material.diffuse = u_Color.rgb;
                    material.alpha = u_Color.a;

                    float timeFactor = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;

                    float height = fsInput.attributes.positionMC.y + u_offsetHeight;

                    float flowFactor = height / u_maxHeight + sin(timeFactor) * 0.1;

                    material.diffuse *= vec3(flowFactor);

                    float timeFactor2 = fract(czm_frameNumber / 400.0);
                    float normalizeHeight = clamp(height / 200., 0.0, 1.0);
                    timeFactor2 = abs(timeFactor2 - 0.5) * 2.0;
                    float glowIntensity = step(0.005, abs(normalizeHeight - timeFactor2));
                    material.diffuse += material.diffuse * (1.0 - glowIntensity);
                }
            `,
        });
    }

    /**
     * 创建扩散波
     * @returns
     */
    createDiffuse() {
        let boundingSphere = this.tileset.boundingSphere;
        let center = boundingSphere.center;
        let radius = boundingSphere.radius;

        let m = diffusedAppearance(viewer, {
            color: this.option.color,
            speed: 0.7,
        });
        let primitive = new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.EllipseGeometry({
                    center: center,
                    semiMajorAxis: radius,
                    semiMinorAxis: radius,
                    vertexFormat: Cesium.VertexFormat.ALL,
                }),
            }),
            classificationType: this.option.classificationType,
            appearance: m.material,
        });
        primitive.show = !!this.option.openDiffuse;
        this.collection.add(primitive);
        return {
            primitive,
            removeUpdate: m.removeUpdate,
        };
    }
}
