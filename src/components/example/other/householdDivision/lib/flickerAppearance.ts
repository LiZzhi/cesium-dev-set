import { Color } from "cesium";

export type flickerOptionType = {
    color: Color;   // 颜色,默认红色
    speed: number;  // 增长速度,一般在0-1000即可,默认20
    alpha: number;  // 闪烁最大透明度,默认1.0
}

/**
 * @description: 闪烁材质
 * @param {Partial<flickerOptionType>} option
 * @return {*}
 */
export default function (option: Partial<flickerOptionType> = {}) {
    let o = defaultOptions();
    o = Object.assign(o, option);
    return new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: o.color,
                    speed: o.speed,
                    alpha: o.alpha,
                },
                source: `
                    uniform vec4 color;
                    uniform float speed;
                    uniform float alpha;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        float time = fract(czm_frameNumber * speed / 1000.0);
                        float newAlpha;
                        if(time >= alpha) {
                            newAlpha = alpha;
                        } else {
                            newAlpha = time;
                        }
                        material.diffuse = color.rgb;
                        material.alpha = newAlpha;
                        return material;
                    }
                `
            },
            translucent: true
        }),
        faceForward: false,
        closed: false
    });
}

function defaultOptions() {
    return {
        color: Cesium.Color.RED,
        speed: 20,
        alpha: 1.0,
    }
}
