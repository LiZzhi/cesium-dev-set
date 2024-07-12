/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-11 19:15:16
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-07-12 15:22:22
 * @FilePath: \cesium-secdev-set\src\secdev\other\edgeStage.ts
 * @Description: 3D描边(优化版) 参考：https://zhuanlan.zhihu.com/p/407871786
 */
import { Color, Viewer, PostProcessStageComposite } from "cesium";
import CesiumRenderPass from "./cesiumRenderPass/CesiumRenderPass";
import createBlurStage from "./cesiumRenderPass/createBlurStage";

export type EdgeStageOptionType = {
    edgeOnly: boolean; // 清空画布，只保留选中的实体(谨慎开启)
    showGlow: boolean;  // 是否发光
    edgeGlow: number; // 发光宽度，单位为像素/px
    edgeStrength: number; // 轮廓线强度
    showOutlineOnly: boolean; // true则只显示轮廓线，此时thresholdAngle无效
    thresholdAngle: number; // 如果两个三角面的法线间夹角小于该值则标记为同一个平面。该值的单位为弧度
    outlineWidth: number; // 轮廓线宽度，单位为像素/px
    visibleEdgeColor: Color; // 未被遮挡的轮廓线颜色
    hiddenEdgeColor: Color; // 被遮挡的轮廓线颜色
    useSingleColor: boolean; // true则遮挡和未被遮挡的轮廓线都使用同一个颜色，这样可以提升一小部分性能
};

export default class {
    name: string;
    viewer: Viewer;
    option: EdgeStageOptionType;
    edgeStage: PostProcessStageComposite | null;
    cesiumStage: PostProcessStageComposite | null;
    /**
     * 边缘检测描边
     * @param viewer viewer
     * @param name 名称
     * @param option 配置项
     */
    constructor(
        viewer: Viewer,
        name: string,
        option: Partial<EdgeStageOptionType> = {}
    ) {
        this.option = Object.assign(this.defaultOptions, option);
        this.name = name;
        this.viewer = viewer;
        this.edgeStage = null;
        this.cesiumStage = null;
    }

    /**
     * 启用
     */
    init() {
        let that = this;
        const normalDepthPass = new CesiumRenderPass({
            name: this.name + "Pass",
            vertexShader: `
                varying vec3 vOutlineNormal;
                void main(){
                    #ifdef HAS_NORMAL
                        vOutlineNormal = normal;
                    #else
                        #ifdef HAS_V_NORMAL
                            vOutlineNormal = v_normal;
                        #else
                            vOutlineNormal=vec3(0.);
                        #endif
                    #endif
                }
            `,
            fragmentShader: `
                varying vec3 vOutlineNormal;
                void main(){
                    if(!czm_selected()) discard;
                    if(length(vOutlineNormal)>0.)gl_FragColor=vec4( vOutlineNormal ,gl_FragColor.a);
                }
            `,
            // @ts-ignore
            sampler: new Cesium.Sampler({
                minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
                magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
            }),
        });

        const maskStage = new Cesium.PostProcessStage({
            name: this.name + "Mask",
            uniforms: {
                outlineWidth() {
                    return that.option.outlineWidth;
                },
                devicePixelRatio: that.viewer.resolutionScale,
                thresholdAngle: function () {
                    return that.option.thresholdAngle;
                },
                useSingleColor: function () {
                    return that.option.useSingleColor;
                },
                showOutlineOnly: function () {
                    return that.option.showOutlineOnly;
                },
                visibleEdgeColor: function () {
                    return that.option.visibleEdgeColor;
                },
                hiddenEdgeColor: function () {
                    return that.option.hiddenEdgeColor;
                },
                maskTexture() {
                    return normalDepthPass.texture;
                },
                maskDepthTexture() {
                    return normalDepthPass.depthTexture;
                },
            },
            fragmentShader: `
                uniform sampler2D colorTexture;
                uniform vec2 colorTextureDimensions;
                uniform sampler2D depthTexture;

                uniform sampler2D maskTexture;
                uniform sampler2D maskDepthTexture;
                uniform float thresholdAngle;
                uniform bool showOutlineOnly;

                uniform float outlineWidth;
                uniform float devicePixelRatio;
                uniform vec3 visibleEdgeColor;
                uniform vec3 hiddenEdgeColor;
                uniform bool useSingleColor;

                varying vec2 v_textureCoordinates;

                float lengthSq(vec3 v){
                    return v.x * v.x + v.y * v.y + v.z * v.z;
                }
                float normal_angleTo(vec3 a,vec3 b){
                    float denominator =  sqrt(  lengthSq(a) * lengthSq(b) );
                    if ( denominator == 0. ) return czm_pi / 2.;
                    float theta = dot(a, b ) / denominator;
                    // clamp, to handle numerical problems
                    return  acos(  clamp( theta, - 1., 1. ) );
                }

                float compareNormal(vec4 n1,vec4 n2){
                    if(  abs (  normal_angleTo( n1.xyz , n2.xyz ) ) < thresholdAngle ){
                        return 0.;
                    }else{
                        return 1.;
                    }
                }

                float compareDepth(const in vec2 uv){
                    float maskDepth = czm_readDepth( maskDepthTexture, uv);
                    float nonDepth = czm_readDepth( depthTexture, uv);
                    return maskDepth>nonDepth?1.:0.;
                }

                void main(){

                    vec2 vUv=v_textureCoordinates;

                    // vec4 color = texture2D( colorTexture, vUv);
                    vec4 maskColor = texture2D( maskTexture, vUv);

                    if( maskColor.a < 0.0001){
                        // gl_FragColor =color;
                        discard;
                        return;
                    }

                    vec2 invSize = outlineWidth / colorTextureDimensions;
                    vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);

                    vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
                    vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
                    vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
                    vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);

                    float d;
                    if(showOutlineOnly){
                        float diff1 = (c1.a - c2.a)*0.5;
                        float diff2 = (c3.a - c4.a)*0.5;
                        d = length( vec2(diff1, diff2) );
                    }
                    else{
                        float diff1 = compareNormal(c1,c2)*0.5;
                        float diff2 = compareNormal(c3,c4)*0.5;
                        d = length( vec2(diff1, diff2) );
                    }

                    if(useSingleColor==false){
                        float dp1 = compareDepth( vUv + uvOffset.xy);
                        float dp2 = compareDepth( vUv - uvOffset.xy);
                        float dp3 = compareDepth( vUv + uvOffset.yw);
                        float dp4 = compareDepth( vUv - uvOffset.yw);

                        float a1 = min(dp1, dp2);
                        float a2 = min(dp3, dp4);
                        float visibilityFactor = min(a1, a2);
                        vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;

                        // gl_FragColor =color+ vec4( edgeColor , 1. ) * vec4(d);
                        gl_FragColor = vec4( edgeColor , 1. ) * vec4(d);
                    }else{
                        // gl_FragColor =color+ vec4( visibleEdgeColor , 1. ) * vec4(d);
                        gl_FragColor =  vec4( visibleEdgeColor , 1. ) * vec4(d);
                    }
                }
            `,
        });
        normalDepthPass.stage = maskStage;

        const blurStage1 = createBlurStage(this.name + "Blur1", 4, 1, 0.75);
        const blurStage2 = createBlurStage(this.name + "Blur2", 4, 4, 0.5);

        const blurCompositeStage = new Cesium.PostProcessStageComposite({
            name: this.name + "BlurComposite",
            stages: [maskStage, blurStage1, blurStage2],
            inputPreviousStageTexture: true,
        });

        const addStage = new Cesium.PostProcessStage({
            name: this.name + "Additive",
            uniforms: {
                showGlow: function () {
                    return that.option.showGlow;
                },
                edgeGlow: function () {
                    return that.option.edgeGlow;
                },
                edgeStrength: function () {
                    return that.option.edgeStrength;
                },
                edgeOnly() {
                    return that.option.edgeOnly;
                },
                maskTexture() {
                    return normalDepthPass.texture;
                },
                lineTexture: maskStage.name,
                edgeTexture1: blurStage1.name,
                edgeTexture2: blurCompositeStage.name,
            },
            fragmentShader: `
                uniform sampler2D colorTexture;
                uniform sampler2D edgeTexture1;
                uniform sampler2D edgeTexture2;
                uniform sampler2D lineTexture;
                uniform sampler2D maskTexture;
                uniform bool showGlow;
                uniform float edgeGlow;
                uniform bool edgeOnly;
                uniform float edgeStrength;

                varying vec2 v_textureCoordinates;
                void main(){

                    vec2 vUv =v_textureCoordinates;
                    vec4 edgeColor=texture2D( lineTexture, vUv);
                    vec4 color=texture2D( colorTexture, vUv);
                    float opacity=1.;
                    if(edgeOnly){
                        vec4 maskColor=texture2D( maskTexture, vUv);
                        opacity=1.-maskColor.a;
                        gl_FragColor = maskColor;
                        return;
                    }

                    if(showGlow){
                        float visFactor= czm_selected()?1.:0.;
                        vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
                        vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
                        vec4 glowColor = edgeValue1 + edgeValue2 * edgeGlow;
                        gl_FragColor = opacity * color + edgeColor + edgeStrength * (1. - edgeColor.r) * glowColor;
                    }
                    else{
                        gl_FragColor = opacity * color + edgeColor;
                    }
                }
            `,
        });

        const edgeStage = new Cesium.PostProcessStageComposite({
            name: this.name + "Composite",
            stages: [blurCompositeStage, addStage],
            inputPreviousStageTexture: false,
        });

        this.#defUniforms(edgeStage);
        // @ts-ignore
        edgeStage._uniforms = edgeStage._uniforms || {};
        // @ts-ignore
        this.#defUniforms(edgeStage._uniforms);
        edgeStage.selected = [];
        edgeStage.enabled = false;
        this.viewer.postProcessStages.add(edgeStage);
        this.edgeStage = edgeStage;

        const cesiumStage =
            Cesium.PostProcessStageLibrary.createSilhouetteStage();
        cesiumStage.enabled = false;
        this.viewer.postProcessStages.add(cesiumStage);

        this.cesiumStage = cesiumStage;

        // viewer.postProcessStages.fxaa.enabled = true
        // viewer.scene.globe.depthTestAgainstTerrain = true
    }

    /**
     * 移除
     */
    remove() {
        this.edgeStage && this.viewer.postProcessStages.remove(this.edgeStage);
        this.cesiumStage &&
            this.viewer.postProcessStages.remove(this.cesiumStage);
        this.edgeStage = null;
        this.cesiumStage = null;
    }

    /**
     * 修改高亮
     * @param pickIds 拾取的ID数组
     */
    changeSelect(pickIds: any[]) {
        const pickObj = pickIds.map((v) => {
            return {
                pickId: v,
            };
        });
        if (pickObj.length && this.edgeStage && this.cesiumStage) {
            this.edgeStage.selected = pickObj;
            this.cesiumStage.selected = pickObj;
            this.edgeStage.enabled = !this.cesiumStage.enabled;
        }
    }

    /**
     * 清空选择
     */
    clearSelect() {
        if (this.edgeStage && this.cesiumStage) {
            this.edgeStage.selected = [];
            this.cesiumStage.selected = [];
            this.edgeStage.enabled = false;
            this.cesiumStage.enabled = false;
        }
    }

    #defUniforms(obj: PostProcessStageComposite) {
        let that = this;
        Object.defineProperties(obj, {
            showGlow: {
                get() {
                    return that.option.showGlow;
                },
                set(val) {
                    that.option.showGlow = val;
                },
            },
            edgeGlow: {
                get() {
                    return that.option.edgeGlow;
                },
                set(val) {
                    that.option.edgeGlow = val;
                },
            },
            edgeStrength: {
                get() {
                    return that.option.edgeStrength;
                },
                set(val) {
                    that.option.edgeStrength = val;
                },
            },
            thresholdAngle: {
                get() {
                    return that.option.thresholdAngle;
                },
                set(val) {
                    that.option.thresholdAngle = val;
                },
            },
            showOutlineOnly: {
                get() {
                    return that.option.showOutlineOnly;
                },
                set(val) {
                    that.option.showOutlineOnly = val;
                },
            },
            edgeOnly: {
                get() {
                    return that.option.edgeOnly;
                },
                set(val) {
                    that.option.edgeOnly = val;
                },
            },
            useSingleColor: {
                get() {
                    return that.option.useSingleColor;
                },
                set(val) {
                    that.option.useSingleColor = val;
                },
            },
            outlineWidth: {
                get() {
                    return that.option.outlineWidth;
                },
                set(val) {
                    that.option.outlineWidth = val;
                },
            },
            visibleEdgeColor: {
                get() {
                    return that.option.visibleEdgeColor;
                },
                set(val) {
                    that.option.visibleEdgeColor = val;
                },
            },
            hiddenEdgeColor: {
                get() {
                    return that.option.hiddenEdgeColor;
                },
                set(val) {
                    that.option.hiddenEdgeColor = val;
                },
            },
        });
    }

    /**
     * 默认参数
     */
    get defaultOptions(): EdgeStageOptionType {
        return {
            edgeOnly: false,
            showGlow: true,
            edgeGlow: 1,
            edgeStrength: 3,
            showOutlineOnly: false,
            thresholdAngle: (12 * Math.PI) / 180,
            outlineWidth: 1,
            visibleEdgeColor: Cesium.Color.WHITE,
            hiddenEdgeColor: Cesium.Color.DARKRED,
            useSingleColor: false,
        };
    }
}
