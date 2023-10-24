/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-24 15:48:04
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-24 16:37:43
 * @FilePath: \cesium-secdev-set\src\secdev\utils\gridInterpolation.ts
 * @Description: 网格划分多边形，计算插值点
 */

import { worldDegreesType } from "../type";

/**
 * @description: 网格划分多边形，计算插值点
 * @param {number[][][]} polygon 多边形坐标数组，经纬度(角度)
 * @param {number} meshLen (可选)正方形网格边长，默认为划分10000个正方形
 * @return {*}
 */
export default function gridInterpolation(polygon: number[][][], meshLen?: number){
    const turfPolygon = turf.polygon(polygon);

    const turfExtent = turf.bbox(turfPolygon);
    // 如果不存在，则默认划分为1W个网格
    meshLen = meshLen ? meshLen : Math.sqrt(turf.area(turfPolygon) / 10000);

    const turfSamplePoints=turf.pointGrid(turfExtent, meshLen,{
        units:'meters',
        mask: turfPolygon,
    });
    // 移除多边形外的插值点
    let features = turf.pointsWithinPolygon(turfSamplePoints, turfPolygon).features;

    let lonlats:worldDegreesType[] = [];
    for (let i = 0; i < features.length; i++) {
        lonlats.push({
            lon: features[i].geometry.coordinates[0],
            lat: features[i].geometry.coordinates[1]
        });
    }
    return lonlats;
}