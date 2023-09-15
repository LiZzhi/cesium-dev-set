/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-09-05 11:04:55
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-09-05 11:06:28
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\gradientAppearance.ts
 * @Description: 区域标注材质
 */
import { Color } from "cesium";

/**
 * @description:
 * @param {Color} color 颜色
 * @return {MaterialAppearance} 材质
 */
export default function(color: Color){
    return new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: color
                },
                source: `
                    uniform vec4 color;
                    czm_material czm_getMaterial(czm_materialInput materialInput)
                    {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        float alpha = distance(st,vec2(0.5, 0.5));
                        material.alpha = color.a  * alpha  * 1.5;
                        material.diffuse = color.rgb * 1.3;
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
