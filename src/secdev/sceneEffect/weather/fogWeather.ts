import { Color, Viewer } from "cesium";

export type fogOptionType = {
    visibility: number, // 雾浓度
    fogColor: Color,    // 雾颜色
}

export default function fogWeather(viewer: Viewer, options: Partial<fogOptionType>={}){
    let o = Object.assign({
        visibility: 0.1,
        fogColor: new Cesium.Color(0.8,0.8,0.8,0.5)
    }, options)
    const wfStage = new Cesium.PostProcessStage({
        fragmentShader: fogSource(),
        uniforms: {
            visibility: o.visibility,
            fogColor: o.fogColor,
        }
    });
    viewer.scene.postProcessStages.add(wfStage);
    return function () {
        viewer.scene.postProcessStages.remove(wfStage);
    }
}

function fogSource(){
    return `
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        uniform float visibility;
        uniform vec4 fogColor;
        varying vec2 v_textureCoordinates;
        void main(){
            vec4 origcolor = texture2D(colorTexture, v_textureCoordinates);
            float depth = czm_readDepth(depthTexture, v_textureCoordinates);
            vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates);
            float f = visibility * (depthcolor.r - 0.3) / 0.2;
            if (f < 0.0){
                f = 0.0;
            }else if (f > 1.0){
                f = 1.0;
            }
            gl_FragColor = mix(origcolor, fogColor, f);
        }
    `
}