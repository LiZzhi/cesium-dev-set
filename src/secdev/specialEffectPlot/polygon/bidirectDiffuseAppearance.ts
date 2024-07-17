/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-17 11:44:20
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-07-17 11:53:01
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\bidirectDiffuseAppearance.ts
 * @Description: 双向扩散圈
 */


import { Viewer } from "cesium";

export type bidirectDiffuseOptionType = {
    speed: number; // 速度
}

/**
 * @description: 双向扩散圈
 * @param {Partial<bidirectDiffuseOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<bidirectDiffuseOptionType> = {}){
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
                    vec3 palette( float t ) {
                        vec3 a = vec3(0.5, 0.5, 0.5);
                        vec3 b = vec3(0.5, 0.5, 0.5);
                        vec3 c = vec3(1.0, 1.0, 1.0);
                        vec3 d = vec3(0.263, 0.416, 0.557);

                        return a + b * cos(6.28318 * (c * t + d));
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput)
                    {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;

                        vec2 uv= st * 10. - 5.;
                        vec2 uv2 = uv;

                        vec2 uv0 = uv2;
                        vec4 finalColor = vec4(0.0);

                        for (float i = 0.0; i < 4.0; i++) {
                            uv2 = fract(uv2 * 1.5) - 0.5;

                            float d = length(uv) * exp(-length(uv0));

                            vec3 col = palette(length(uv0) + i*.4 + time*.4);

                            d = sin(d*8. + time)/8.;
                            d = abs(d);

                            d = pow(0.01 / d, 1.2);

                            finalColor += vec4(col * d, d - .2);
                        }

                        material.diffuse = vec3(0.35,0.2,1.15) * 1.75 * finalColor.rgb;
                        material.alpha = finalColor.a;
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
        speed: 2.0,
    }
}
