/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-22 11:41:03
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-22 13:56:43
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\dynamicMaskAppearance2.ts
 * @Description: 动态遮罩材质2
 */

import { Viewer } from "cesium";

export type dynamicMaskOptionType = {
    speed: number; // 速度
};

export default function (viewer: Viewer, option: Partial<dynamicMaskOptionType> = {}) {
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

                    vec3 palette( float t ) {
                        vec3 a = vec3(0.5, 0.5, 0.5);
                        vec3 b = vec3(0.5, 0.5, 0.5);
                        vec3 c = vec3(1.0, 1.0, 1.0);
                        vec3 d = vec3(0.263,0.416,0.557);

                        return a + b*cos( 6.28318*(c*t+d) );
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 2. - 1.;
                        vec2 uv0 = uv;
                        vec3 finalColor = vec3(0.0);

                        for (float i = 0.0; i < 4.0; i++) {
                            uv = fract(uv * 1.5) - 0.5;

                            float d = length(uv) * exp(-length(uv0));

                            vec3 col = palette(length(uv0) + i*.4 + time*.4);

                            d = sin(d*8. + time)/8.;
                            d = abs(d);

                            d = pow(0.01 / d, 1.2);

                            finalColor += col * d;
                        }
                        material.diffuse = finalColor;
                        material.alpha = 1.;

                        return material;
                    }
                `,
            },
            translucent: true,
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false,
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds =
            ((performance.now() - startTime) / 1000) * o.speed;
        m.material.uniforms = {
            ...o,
            time: elapsedTimeSeconds,
        };
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
        speed: 1.0, // 速度
    };
}
