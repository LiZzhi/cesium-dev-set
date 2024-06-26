/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-06-25 16:16:42
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-06-26 14:34:31
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\haloAppearance.ts
 * @Description: 光晕扩散圆材质
 */

import { Color, Viewer } from "cesium";

export type haloOptionType = {
    innerColor: Color;   // 内部颜色
    outColor: Color;   // 外部颜色
    alpha: number; // 透明度
    width: number;  // 扩散线宽度
    power: number; // 光晕厚度
    radius: number;
    speed: number; // 扩散速度
}

/**
 * @description: 扩散圈材质
 * @param {Partial<haloOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<haloOptionType> = {}){
    let o = defaultOptions();
    o = Object.assign(o, option);
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    ...o,
                    time: 0,
                },
                source: `
                    uniform float time;
                    uniform float alpha;
                    uniform float width;
                    uniform float power;
                    uniform float radius;
                    uniform vec4 innerColor;
                    uniform vec4 outColor;

                    vec4 drawCircle(vec2 pos, vec3 color) {
                        float dist1 = length(pos);
                        dist1 = fract((dist1 * 5.0) - fract(time));
                        float dist2 = dist1 - radius;
                        float intensity = pow(radius / abs(dist2), width);
                        float m = max((0.8- abs(dist2)), 0.0);
                        vec4 col = vec4(color * intensity * power * m, alpha * m);
                        return col;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;

                        // -1.0 ~ 1.0
                        vec2 pos = -1. + 2. * st;

                        vec3 color = mix(innerColor.rgb, outColor.rgb, length(pos));
                        vec4 finalColor = drawCircle(pos, color);

                        material.alpha = finalColor.a;
                        material.diffuse = finalColor.rgb;

                        return material;
                    }
                `
            },
            translucent: true
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false
    });
    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds = (performance.now() - startTime) / 1000 * o.speed;
        m.material.uniforms = {
            ...o,
            time: elapsedTimeSeconds,
        }
    }
    viewer.scene.preRender.addEventListener(update);
    function removeUpdate() {
        viewer.scene.preRender.removeEventListener(update);
    }
    return {
        material: m,
        removeUpdate: removeUpdate,
    };
}

function defaultOptions() {
    return {
        innerColor: new Cesium.Color(0.0, 0.7, 0.8),
        outColor: new Cesium.Color(0.0, 0.5, 0.2),
        alpha: 0.7,
        width: 0.8,
        radius: 0.5,
        power: 0.1,
        speed: 1.0,
    }
}
