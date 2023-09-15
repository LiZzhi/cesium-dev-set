/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-15 18:09:08
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-15 18:16:51
 * @FilePath: \cesium-secdev-set\src\secdev\utils\pointInPolygon.ts
 * @Description: 判断点是否在多边形内
 */

/**
 * @description: 判断点是否在多边形内(角度)
 * @param {number} lon 点经度
 * @param {number} lat 点纬度
 * @param {number} boundary 多边形坐标,三维经纬度数组
 * @return {boolean} 是/否
 */
export default function pointInPolygon(lon: number, lat: number, boundary: number[][][]) {
    let pt = turf.point([lon, lat]);
    let poly = turf.polygon(boundary);
    return turf.booleanPointInPolygon(pt, poly);
}