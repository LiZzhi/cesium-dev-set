/*
 * @Author: “Lizhi” “362042734@qq.com”
 * @Date: 2023-08-28 21:30:32
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-26 20:40:51
 * @FilePath: \cesium-secdev-set\src\secdev\utils\cartographicTool.ts
 * @Description: 角度制的cartographic工具
 */
import { Cartesian3, Cartographic } from "cesium";

export default class cartographicTool {
    /**
     * @description: Cartesian3转经纬度(角度)
     * @param {Cartesian3} p 笛卡尔坐标
     * @param {boolean} z (可选)是否带Z,默认带
     * @return {number[]} [经度, 纬度, 高](角度)
     */
    static formCartesian3(p: Cartesian3, z: boolean = true) {
        let radian = Cesium.Cartographic.fromCartesian(
            p,
            viewer.scene.globe.ellipsoid
        );
        let c = [
            Cesium.Math.toDegrees(radian.longitude),
            Cesium.Math.toDegrees(radian.latitude),
        ];
        if (z) {
            c.push(radian.height);
        }
        return c;
    }

    /**
     * @description: Cartesian3[]转经纬度(角度)
     * @param {Cartesian3[]} ps 笛卡尔坐标数组
     * @param {*} callBack (可选)回调函数，用于修正返回值
     * @param {boolean} z (可选)是否带Z,默认带
     * @return {any[]} 默认为[[经度, 纬度, 高]],回调函数修正后未知
     */
    static formCartesian3S<T = number[]>(
        ps: Cartesian3[],
        callBack?: (c: number[]) => T,
        z: boolean = true,
    ) {
        let cs: T[] = [];
        ps.forEach((v) => {
            let c = cartographicTool.formCartesian3(v, z);
            if (typeof callBack === "function") {
                cs.push(callBack(c));
            } else {
                // @ts-ignore
                cs.push(c);
            }
        });
        return cs;
    }

    /**
     * @description: 经纬度(角度)转Cartesian3
     * @param {number[]} c 经纬度(角度),[经度, 纬度, (可选)高](角度)
     * @return {Cartesian3}
     */
    static toCartesian3(c: number[]) {
        // @ts-ignore
        let cartesian = Cesium.Cartesian3.fromDegrees(...c);
        return cartesian;
    }

    /**
     * @description: 经纬度(角度)转Cartesian3[]
     * @param {*} cs 经纬度(角度),[[经度, 纬度, (可选)高]](角度)
     * @return {Cartesian3[]}
     */
    static toCartesian3S(cs: number[][]) {
        let ps: Cartesian3[] = [];
        cs.forEach((v) => {
            let p = cartographicTool.toCartesian3(v);
            ps.push(p);
        });
        return ps;
    }
}
