/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-25 10:12:38
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-25 10:41:18
 * @FilePath: \cesium-secdev-set\src\secdev\utils\getMinHeight.ts
 * @Description: 计算区域内最低高度
 */
import { Cartesian3, TerrainProvider } from "cesium";
import gridInterpolation from "./gridInterpolation";

/**
 * @description: 计算区域内最低高度
 * @param {TerrainProvider} terrainProvider 地形
 * @param {Cartesian3} positions 区域坐标
 * @param {number} lerpDis (可选)，插值网格边长，默认为分成10000个网格
 * @return {minHeight} 最低高度
 */
export default async function getMinHeight(terrainProvider: TerrainProvider, positions: Cartesian3[], lerpDis?: number) {
    positions = Cesium.clone(positions);
    if (!positions[0].equals(positions[positions.length-1])) {
        positions.push(positions[0]);
    }

    let cs = [positions.map(p => {
        let cat = Cesium.Cartographic.fromCartesian(p);
        return [Cesium.Math.toDegrees(cat.longitude), Cesium.Math.toDegrees(cat.latitude)];
    })];
    // 采样
    let lonlats = gridInterpolation(cs, lerpDis);

    let catArr = lonlats.map(c => {
        return Cesium.Cartographic.fromDegrees(c.lon, c.lat);
    });
    let catHeightArr = await Cesium.sampleTerrainMostDetailed(terrainProvider, catArr);

    // 计算最低高度
    let minHeight = catHeightArr.reduce((h, c) => c.height < h ? c.height : h, Number.POSITIVE_INFINITY);

    return minHeight;
}