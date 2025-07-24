import { Cartesian3, Color, CustomShader, UniformSpecifier } from "cesium";

export type lightOptionsType = {
    position: Cartesian3;
    lightColor?: Color;
    lightRadius?: number;
};

export default function createOption(lightDataList: lightOptionsType[]) {
    if(!lightDataList.length) {
        console.log("没有光源数据");
        return;
    }
    let uniforms: Record<string, UniformSpecifier> = {};
    let moreLightGlsl = "";
    for (let i = 0; i < lightDataList.length; i++) {
        let lightData = lightDataList[i];
        let p = `u_lightPosition_${i}`;
        let c = `u_lightColor_${i}`;
        let r = `u_lightRadius_${i}`;
        uniforms[p] = {
            type: Cesium.UniformType.VEC3,
            value: lightData.position,
        };
        uniforms[c] = {
            type: Cesium.UniformType.VEC3,
            value: lightData.lightColor || Cesium.Color.fromCssColorString("#6900ff"),
        };
        uniforms[r] = {
            type: Cesium.UniformType.FLOAT,
            value: lightData.lightRadius || 1000,
        };
        if (i >=1) {
            moreLightGlsl += createLightGlsl(p, c, r);
        }
    }
    return {
        lightingModel: Cesium.LightingModel.UNLIT,
        uniforms: uniforms,
        fragmentShaderText: `
            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                vec3 positionMC = fsInput.attributes.positionMC;
                vec3 positionEC = fsInput.attributes.positionEC;
                vec3 positionWC=(czm_model * vec4(positionMC,1.0)).xyz;
                vec3 normalEC = fsInput.attributes.normalEC;
                normalEC=normalize(normalEC);
                vec3 finalColor=vec3(0.);
                vec3 lightDirection = (czm_view * vec4(u_lightPosition_0,1.0)).xyz - positionEC;
                float a=dot(normalEC,normalize(lightDirection));
                //衰减
                float distance=length(lightDirection);
                float b=1.-distance/u_lightRadius_0;
                b=max(b, 0.);
                if(b > 0.00001 ) {
                    //叠加为颜色值
                    finalColor=a*u_lightColor_0*b;
                } else{
                    finalColor=vec3(0.,0.,0.);
                }
                ${moreLightGlsl}
                material.diffuse = finalColor;
            }
        `,
    };
}

function createLightGlsl(p: string, c: string, r: string) {
    return `
        //光线方向（眼睛坐标）
        lightDirection = (czm_view * vec4(${p},1.0)).xyz - positionEC;
        //光线于法线的夹角（眼睛坐标）
        a=dot(normalEC,normalize(lightDirection));
        //衰减
        distance=length(lightDirection);
        b=1.-distance/${r};
        b=max(b, 0.);
        if(b > 0.00001 ) {
            //叠加为颜色值
            finalColor= mix(finalColor, a*${c}*b , 0.5);
        }\n
    `;


}
