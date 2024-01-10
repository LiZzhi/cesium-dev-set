/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-01-10 16:04:25
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-01-10 19:15:09
 * @FilePath: \cesium-secdev-set\src\secdev\utils\splitLine.ts
 * @Description: 分割多段线
 */
import { Cartesian3 } from "cesium";

type itemType = {
    start: Cartesian3,
    end: Cartesian3,
    length: number,
}

type gType = {
    items: itemType[],
    length: number,
}

export default class splitLine{
    /**
     * @description: 将线段分割为指定段数
     * @param {Cartesian3[]} positions 线串坐标
     * @param {number} split (可选)分割段数，默认为10
     * @return {Cartesian3[]} 分割点坐标数组
     */
    static byChunk(positions: Cartesian3[], split = 10){
        const g: gType = {
            items: [],
            length: 0,
        }
        positions.reduce((a, b) => {
            const len = Cesium.Cartesian3.distance(a, b);
            g.length += len;
            g.items.push({
                start: a,
                end: b,
                length: len
            })
            return b;
        })

        let splitLength = g.length / split;
        let chunkLength = splitLength;
        let preSumLength = 0;
        let ps: Cartesian3[] = [];
        for (let i = 0; i < g.items.length; i++) {
            let item = g.items[i];
            let nowSumLength = preSumLength + item.length;
            while (chunkLength < nowSumLength) {
                const start = Cesium.Cartographic.fromCartesian(item.start);
                const end = Cesium.Cartographic.fromCartesian(item.end);
                const lon = Cesium.Math.lerp(start.longitude, end.longitude, (chunkLength - preSumLength)/item.length);
                const lat = Cesium.Math.lerp(start.latitude, end.latitude, (chunkLength - preSumLength)/item.length);
                const p = Cesium.Cartesian3.fromRadians(lon, lat);
                ps.push(p);
                chunkLength += splitLength;
            }
            preSumLength = nowSumLength;
        }
        return ps;
    }

    /**
     * @description: 根据指定距离分割线段
     * @param {Cartesian3[]} positions 线串坐标
     * @param {number} distance (可选)分割距离，默认为10米
     * @return {Cartesian3[]} 分割点坐标数组
     */
    static byDistance(positions: Cartesian3[], distance: number = 10){
        let ps: Cartesian3[] = [];
        let preSumLength = 0;
        let chunkLength = distance;
        positions.reduce((a, b) => {
            const len = Cesium.Cartesian3.distance(a, b);
            let nowSumLength = preSumLength + len;
            while (chunkLength < nowSumLength) {
                const start = Cesium.Cartographic.fromCartesian(a);
                const end = Cesium.Cartographic.fromCartesian(b);
                const lon = Cesium.Math.lerp(start.longitude, end.longitude, (chunkLength - preSumLength)/len);
                const lat = Cesium.Math.lerp(start.latitude, end.latitude, (chunkLength - preSumLength)/len);
                const p = Cesium.Cartesian3.fromRadians(lon, lat);
                ps.push(p);
                chunkLength += distance;
            }
            preSumLength = nowSumLength;
            return b;
        })
        return ps;
    }
}