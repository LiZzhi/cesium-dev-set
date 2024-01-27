/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-26 22:05:38
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-26 22:11:27
 * @FilePath: \cesium-secdev-set\src\secdev\utils\hasTerrian.ts
 * @Description: 是否存在地形或是否准备完毕
 */
import { Viewer } from "cesium";

export default function(viewer:Viewer){
    let ready = viewer.terrainProvider?.ready;
    if (ready) {
        return viewer.terrainProvider?.availability;
    } else {
        return false;
    }
}