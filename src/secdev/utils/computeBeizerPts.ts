/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-01-01 22:07:43
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-01-01 22:08:56
 * @FilePath: \cesium-secdev-set\src\secdev\utils\computeBeizerPts.ts
 * @Description: 由控制点计算贝塞尔曲线上的点
 */

/**
 * @description: 由控制点计算贝塞尔曲线上的点
 * @param {number} cpt 经纬度数组
 * @param {*} section
 * @return {*}
 */
export default function(cpt: number[][], section = 20): number[][] {
    // section *= 5;
    let cptSize = cpt.length;
    let bzPoints = [];
    let a0, a1, a2, a3, b0, b1, b2, b3;
    let div = 1.0 / section;
    for (let i = 0; i < cptSize - 3; i += 3) {
        a0 = cpt[i][1];
        a1 = -3 * cpt[i][1] + 3 * cpt[i + 1][1];
        a2 = 3 * cpt[i][1] - 6 * cpt[i + 1][1] + 3 * cpt[i + 2][1];
        a3 = -cpt[i][1] + 3 * cpt[i + 1][1] - 3 * cpt[i + 2][1] + cpt[i + 3][1];

        b0 = cpt[i][0];
        b1 = -3 * cpt[i][0] + 3 * cpt[i + 1][0];
        b2 = 3 * cpt[i][0] - 6 * cpt[i + 1][0] + 3 * cpt[i + 2][0];
        b3 = -cpt[i][0] + 3 * cpt[i + 1][0] - 3 * cpt[i + 2][0] + cpt[i + 3][0];

        let t = 0;
        for (let k = 0; k < section + 1; k++, t += div) {
            let bz = [
                b0 + b1 * t + b2 * t * t + b3 * t * t * t,
                a0 + a1 * t + a2 * t * t + a3 * t * t * t,
            ];
            if (t > 1.0) {
                continue; // 剔除两段贝塞尔曲线的首位重合点
            }
            bzPoints.push(bz);
        }
    }
    return bzPoints;
};