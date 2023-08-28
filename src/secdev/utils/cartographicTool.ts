/*
 * @Author: “Lizhi” “362042734@qq.com”
 * @Date: 2023-08-28 21:30:32
 * @LastEditors: “Lizhi” “362042734@qq.com”
 * @LastEditTime: 2023-08-28 21:31:01
 * @FilePath: \cesium-secdev-set\src\secdev\utils\cartographicTool.ts
 * @Description: 角度制的cartographic工具
 */
import { Cartesian3, Cartographic } from "cesium";

export default class cartographicTool{
    static formCartesian3(p: Cartesian3){
        let radian = Cesium.Cartographic.fromCartesian(p, viewer.scene.globe.ellipsoid);
        return new Cesium.Cartographic(
            Cesium.Math.toDegrees(radian.longitude),
            Cesium.Math.toDegrees(radian.latitude),
            radian.height,
        )
    }

    static formCartesian3S(ps: Cartesian3[]){
        let cs:Cartographic[] = [];
        ps.forEach(v => {
            cs.push(cartographicTool.formCartesian3(v));
        })
        return cs;
    }
}