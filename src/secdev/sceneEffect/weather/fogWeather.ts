import { Viewer } from "cesium";

export default function fogWeather(viewer: Viewer){
    const wfStage = new Cesium.PostProcessStage({
        fragmentShader: fogSource(),
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
        varying vec2 v_textureCoordinates;
        void main(){
            vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);
            vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);
            float depth = czm_readDepth(depthTexture, v_textureCoordinates);
            vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);
            float f=(depthcolor.r-0.7)/0.2;
            if(f<0.0) f=0.0;
            else if(f>1.0) f=1.0;
            gl_FragColor = mix(origcolor,fogcolor,f);
        }
    `
}