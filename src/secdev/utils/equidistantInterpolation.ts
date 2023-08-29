/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-29 10:01:31
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-29 10:10:21
 * @FilePath: \cesium-secdev-set\src\secdev\utils\equidistantInterpolation.ts
 * @Description: 两点间等距线性插值，返回所有点(包括首尾)
 */

import { Cartesian3, Cartographic } from "cesium";

/**
 * @description: 两点间等距线性插值，返回所有点(包括首尾)
 * @param {Cartesian3} start 起始点
 * @param {Cartesian3} end 终点
 * @param {number} distance (可选)采样间隔,默认为1米
 * @return {Cartographic[]}
 */
export default function equidistantInterpolation(start: Cartesian3, end: Cartesian3, distance: number=1){
    // 不贴地坐标
    let lerpArray:Cartographic[] = [];
    //插值数量
    let splitNum = Math.floor(Cesium.Cartesian3.distance(start, end)/distance);

    let startCartographic = Cesium.Cartographic.fromCartesian(start);
    let endCartographic = Cesium.Cartographic.fromCartesian(end);

    lerpArray.push(new Cesium.Cartographic(startCartographic.longitude, startCartographic.latitude));
    for (let i = 1; i < splitNum; i++) {
        const lon = Cesium.Math.lerp(startCartographic.longitude, endCartographic.longitude, i/splitNum);
        const lat = Cesium.Math.lerp(startCartographic.latitude, endCartographic.latitude, i/splitNum);
        lerpArray.push(new Cesium.Cartographic(lon, lat))
    }
    return lerpArray;
}
