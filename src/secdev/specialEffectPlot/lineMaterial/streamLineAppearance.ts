/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-04 15:54:23
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-07-04 16:46:38
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\lineMaterial\streamLineAppearance.ts
 * @Description: 流光线
 */

import { Color } from "cesium";

export type streamLineOptionType = {
    color: Color,
    image: string,
    speed: number,
}

export default function (option: Partial<streamLineOptionType> = {}) {
    let o = Object.assign({
        color: Cesium.Color.fromCssColorString("#7ffeff"),
        image: require("../../assets/img/lineMaterial/精灵线材质01.png"),
        speed: 1.0
    }, option);

    let m = new Cesium.PolylineMaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    ...o,
                    time: 0,
                },
                source: `
                        uniform vec4 color;
                        uniform sampler2D image;
                        uniform float time;

                        czm_material czm_getMaterial(czm_materialInput materialInput){
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            vec2 st = materialInput.st;
                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
                            material.alpha = colorImage.a * color.a;
                            material.diffuse = colorImage.rgb;
                            return material;
                        }
                    `,
            },
        }),
        translucent: true,
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

