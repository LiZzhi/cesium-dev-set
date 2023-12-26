/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-27 10:17:30
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-26 20:29:53
 * @FilePath: \cesium-secdev-set\src\secdev\utils\booleanClockwise.ts
 * @Description: 判断点顺序是否为顺时针
 */
import { Cartesian3 } from "cesium";
import cartographicTool from "./cartographicTool";

/**
 * @description: 判断点顺序是否为顺时针
 * @param {Cartesian3} positions 坐标数组
 * @return {*}
 */
export default function booleanClockwise(positions: Cartesian3[]){
    let degreesArrary = positions.map(position => {
        return cartographicTool.formCartesian3(position, false);
    });
    if (!positions[0].equals(positions[positions.length-1])) {
        //首尾闭合
        degreesArrary.push(degreesArrary[0]);
    }
    let lineString = turf.lineString(degreesArrary);
    return turf.booleanClockwise(lineString);
}