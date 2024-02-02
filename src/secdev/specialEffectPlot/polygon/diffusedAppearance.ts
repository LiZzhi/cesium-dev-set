/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-02-02 15:10:28
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-02-02 15:28:18
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\diffusedAppearance.ts
 * @Description: 扩散材质
 */

import { Color } from "cesium";

export type diffusedOptionType = {
    color: Color;   // 颜色
    speed: number;  // 速度
    alpha: number;  // 透明度
}


/**
 * @description: 扩散材质
 * @param {Partial<diffusedOptionType>} option
 * @return {*}
 */
export default function(option: Partial<diffusedOptionType> = {}){
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

                    vec3 circlePing(float r, float innerTail,  float frontierBorder, float timeResetSeconds,  float radarPingSpeed,  float fadeDistance){
                        float t = fract(czm_frameNumber * speed / 1000.0);
                        float time = mod(t, timeResetSeconds) * radarPingSpeed;
                        float circle;
                        circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
                        circle *= smoothstep(fadeDistance, 0.0, r);
                        return vec3(circle);
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st * 2.0  - 1.0 ;
                        vec2 center = vec2(0.);
                        float time = fract(czm_frameNumber * speed / 1000.0);
                        vec3 flagColor;
                        float r = length(st - center) / 4.;
                        flagColor += circlePing(r, 0.25, 0.025, 4.0, 0.3, 1.0) * color.rgb;
                        material.alpha = length(flagColor) * alpha;
                        material.diffuse = flagColor.rgb;
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
        speed: 25.0,
        alpha: 1.0,
    }
}
