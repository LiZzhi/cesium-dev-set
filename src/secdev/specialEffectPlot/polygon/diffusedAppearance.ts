/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-02-02 15:10:28
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-11 14:10:21
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\diffusedAppearance.ts
 * @Description: 扩散材质
 */

import { Color, Viewer } from "cesium";

export type diffusedOptionType = {
    color: Color;   // 颜色
    speed: number;  // 速度
}


/**
 * @description: 扩散材质
 * @param {Partial<diffusedOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<diffusedOptionType> = {}){
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
                    uniform vec4 color;
                    uniform float time;

                    vec3 circlePing(float r, float innerTail,  float frontierBorder, float timeResetSeconds,  float radarPingSpeed,  float fadeDistance){
                        float t = mod(time, timeResetSeconds) * radarPingSpeed;
                        float circle;
                        circle += smoothstep(t - innerTail, t, r) * smoothstep(t + frontierBorder,t, r);
                        circle *= smoothstep(fadeDistance, 0.0, r);
                        return vec3(circle);
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st * 2.0  - 1.0 ;
                        vec2 center = vec2(0.);
                        vec3 flagColor;
                        float r = length(st - center) / 4.;
                        flagColor += circlePing(r, 0.25, 0.025, 1.5, 0.3, 1.0) * color.rgb;
                        material.alpha = length(flagColor) * color.a;
                        material.diffuse = flagColor.rgb;
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
        color: Cesium.Color.RED,
        speed: 1.0,
    }
}
