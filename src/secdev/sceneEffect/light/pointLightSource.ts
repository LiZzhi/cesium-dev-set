import { Cartesian3, Color, CustomShader, UniformSpecifier } from "cesium";

export type lightOptionsType = {
    position: Cartesian3; // 光源位置
    lightColor?: Color; // 光源颜色
    lightRadius?: number; // 光源辐射半径
};

export default function createOption(lightDataList: lightOptionsType[], options: {
    baseColor?: Color, // 3dtiles底色，默认为原色
    useLight?: boolean, // 是否采用光照及阴影，默认为 true
} = {}) {
    if(!lightDataList.length) {
        console.log("没有光源数据");
        return;
    }
    options = Object.assign({
        baseColor: new Cesium.Color(-1, -1, -1),
        useLight: true,
    }, options)
    let uniforms: Record<string, UniformSpecifier> = {
        u_baseColor: {
            type: Cesium.UniformType.VEC3,
            value: options.baseColor!,
        }
    };
    let moreLightGlsl = "";
    for (let i = 0; i < lightDataList.length; i++) {
        let lightData = lightDataList[i];
        uniforms[`u_lightPosition_${i}`] = {
            type: Cesium.UniformType.VEC3,
            value: lightData.position,
        };
        uniforms[`u_lightColor_${i}`] = {
            type: Cesium.UniformType.VEC3,
            value: lightData.lightColor || Cesium.Color.fromCssColorString("#6900ff"),
        };
        uniforms[`u_lightRadius_${i}`] = {
            type: Cesium.UniformType.FLOAT,
            value: lightData.lightRadius || 1000,
        };
        moreLightGlsl += createLightGlsl(i);
    }
    return {
        lightingModel: options.useLight ? Cesium.LightingModel.PBR : Cesium.LightingModel.UNLIT,
        uniforms: uniforms,
        fragmentShaderText: `
            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                vec3 positionWC = (czm_model * vec4(fsInput.attributes.positionMC, 1.0)).xyz;
                vec3 normalEC = normalize(fsInput.attributes.normalEC);
                vec3 totalLight = vec3(0.0);
                vec3 baseColor;
                if (u_baseColor == vec3(-1., -1., -1.)) {
                    baseColor = material.diffuse;
                } else {
                    baseColor = u_baseColor;
                }
                ${moreLightGlsl}
                material.diffuse = totalLight;
            }
        `,
    };
}

function createLightGlsl(i: number) {
    return `
        // 计算光源
        vec3 lightDir_${i} = u_lightPosition_${i} - positionWC;
        float distance_${i} = length(lightDir_${i});
        vec3 lightDirection_${i} = normalize(lightDir_${i});
        float diffuseFactor_${i} = max(dot(normalEC, lightDirection_${i}), 0.9);
        vec3 diffuse_${i} = diffuseFactor_${i} * u_lightColor_${i};
        float distanceFactor_${i} = clamp(distance_${i} / u_lightRadius_${i}, 0.2, 1.0);
        // 修改基础颜色
        vec3 customColor_${i} = baseColor;
        // 如果在光源范围外，设置渐变颜色
        vec3 mixedColor_${i} = mix(customColor_${i}, diffuse_${i}, 1.0 - distanceFactor_${i});
        totalLight += mixedColor_${i};
    `;
}
