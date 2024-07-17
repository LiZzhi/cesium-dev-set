/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-17 10:08:03
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-07-17 11:04:10
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\electricLightAppearance.ts
 * @Description: 电光特效
 */

import { Viewer } from "cesium";

export type electricLightOptionType = {
    speed: number; // 流动速度
    alpha: number; // 透明度
}

/**
 * @description: 电光特效
 * @param {Partial<electricLightOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<electricLightOptionType> = {}){
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
                    uniform float alpha;

                    const float e = 2.718281828459;

                    czm_material czm_getMaterial(czm_materialInput materialInput)
                    {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;

                        vec2 uv = st * 640.;
                        vec2 v = vec2(640.);
                        vec2 u = .2 * (2. * uv - v) / v.y;

                        vec4 z = vec4(1,2,3,0);
                        vec4 color = vec4(1,2,3,0);

                        float a = .5;
                        float t = time;
                        for (float i = 0.;  i < 19.; ++i){
                            color += (1. + cos(z + t)) / length((1.+i * dot(v,v)) * sin(1.5 * u / (.5 - dot(u,u)) - 9.* u.yx + t));

                            v = cos(++t - 7.* u * pow(a += 0.03, i)) - 5.* u;

                            u *= mat2(cos(i + .02 * t - vec4(0,11,33,0)));
                            u += .2 * a * u + cos(4. / exp(dot(color, color) / 1e2) + t) / 3e2;
                        }

                        color = 25.6 / (min(color, 13.) + 164. / color)  - dot(u, u) / 250.;

                        material.diffuse = color.rgb;
                        material.alpha = alpha;
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
        alpha: 1.0,
        speed: 1.0,
    }
}
