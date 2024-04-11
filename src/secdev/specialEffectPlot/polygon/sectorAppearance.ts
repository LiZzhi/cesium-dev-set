/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-08 10:02:09
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-08 11:22:15
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\sectorAppearance.ts
 * @Description: 扇形扫描圈
 */


import { Color, Viewer } from "cesium";

export type sectorOptionType = {
    color: Color;   // 背景
    sectorColor: Color; // 扇形颜色
    width: number;  // 扩散线宽度
    offset: number; // 扩散颜色插值间隔
    speed: number; // 扩散速度
}


/**
 * @description: 扇形扫描圈
 * @param {Partial<sectorOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<sectorOptionType> = {}){
    let o = defaultOptions();
    o = Object.assign(o, option);
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    ...o,
                    radians: 0,
                },
                source: `
                    uniform vec4 color;
                    uniform vec4 sectorColor;
                    uniform float width;
                    uniform float radians;
                    uniform float offset;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        float dis = distance(st, vec2(0.5));

                        float sp = 0.1;
                        float m = mod(dis, sp);
                        float alpha = step(sp * (1.0 - width * 10.0), m);
                        alpha = clamp(alpha, 0.2, 1.0);
                        material.alpha = alpha;
                        material.diffuse = color.rgb;

                        // 绘制十字线
                        if ((st.s > 0.5 - width / 2.0 && st.s < 0.5 + width / 2.0) || (st.t > 0.5 - width / 2.0 && st.t < 0.5 + width / 2.0)) {
                            alpha = 1.0;
                            material.diffuse = color.rgb;
                            material.alpha = alpha;
                        }

                        // 绘制光晕
                        float ma = mod(dis + offset, 0.5);
                        if (ma < 0.25){
                            alpha = ma * 3.0 + alpha;
                        } else{
                            alpha = 3.0 * (0.5 - ma) + alpha;
                        }
                        material.alpha = alpha;
                        material.diffuse = sectorColor.rgb;

                        // 绘制扇区
                        vec2 xy = materialInput.st;
                        float rx = xy.x - 0.5;
                        float ry = xy.y - 0.5;
                        float at = atan(ry, rx);
                        // 半径
                        float radius = sqrt(rx * rx + ry * ry);
                        // 扇区叠加旋转角度
                        float current_radians = at + radians;
                        xy = vec2(cos(current_radians) * radius, sin(current_radians) * radius);
                        xy = vec2(xy.x + 0.5, xy.y + 0.5);

                        // 扇区渐变色渲染
                        if (xy.y - xy.x < 0.0 && xy.x > 0.5 && xy.y > 0.5){
                            material.alpha = alpha + 0.2;
                            material.diffuse = sectorColor.rgb;
                        }

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
            radians: elapsedTimeSeconds,
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
        color: new Cesium.Color(0.0, 0.7, 0.8),
        sectorColor: new Cesium.Color(0.0, 0.7, 0.8),
        width: 0.002,
        radians: 0,
        offset: 0.2,
        speed: 1.0,
    }
}
