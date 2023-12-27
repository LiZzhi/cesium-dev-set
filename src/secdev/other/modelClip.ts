/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-26 17:17:45
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-27 18:33:29
 * @FilePath: \cesium-secdev-set\src\secdev\other\modelClip.ts
 * @Description: 模型裁剪
 */
import { Cartesian3, Cesium3DTileset, Matrix4, ClippingPlane } from "cesium";
import booleanClockwise from "../utils/booleanClockwise";

export default class modelClip {
    clip(tileset: Cesium3DTileset, positions: Cartesian3[]){
        let bClockwise = booleanClockwise(positions);   // 判断点顺序是否为顺时针
        if (bClockwise) {
            //顺时针 需要转换点的顺序
            positions = positions.reverse();
        }
        let length = positions.length;
        if (length < 3) {
            return false;
        }
        let inverseTransform = this.#getInverseTransform(tileset);
        let planes: ClippingPlane[] = [];
        for (let i = 1; i < length; i++) {
            let p1 = positions[i-1];
            let p2 = positions[i];
            let plane = this.#createPlane(p1, p2, inverseTransform);
            planes.push(plane);
        }

        let p1 = positions[length-1];
        let p2 = positions[0];
        let plane = this.#createPlane(p1, p2, inverseTransform);
        planes.push(plane);

        tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: planes,
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.WHITE
        });
        return true;
    }

    remove(tileset: Cesium3DTileset){
        tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: [],
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.WHITE
        });
    }

    /**
     * @description: 获取模型远点位置矩阵的逆
     * @param {Cesium3DTileset} tileset 模型
     * @return {*}
     */
    #getInverseTransform(tileset: Cesium3DTileset) {
        let transform: Matrix4;
        let tmp = tileset.root.transform;
        if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
            // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
            transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);
        } else {
            transform = tileset.root.transform.clone();
        }
        return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());
    }

    /**
     * @description: 构造ClippingPlane
     * @param {Cartesian3} startPosition 起点
     * @param {Cartesian3} endPosition 终点
     * @param {Matrix4} inverseTransform 转换矩阵
     * @return {ClippingPlane} ClippingPlane
     */
    #createPlane(startPosition: Cartesian3, endPosition: Cartesian3, inverseTransform: Matrix4) {
        let p1 = this.#transformPoint(startPosition, inverseTransform);
        let p2 = this.#transformPoint(endPosition, inverseTransform);
        // 定义一个垂直向上的向量up
        let up = new Cesium.Cartesian3(0, 0, 10);
        console.log(p2, p1);
        // right 实际上就是由p1指向p2的向量
        let right = Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3());
        // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
        let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(normal, normal);
        //通过法向量和过平面的一点，构造平面，并进一步构造ClippingPlane
        let plane = Cesium.Plane.fromPointNormal(p1, normal);
        return Cesium.ClippingPlane.fromPlane(plane);
    }

    /**
     * @description: 通过指定逆矩阵进行坐标转换，目的将坐标转换为模型原点为中心的局部坐标系坐标
     * @param {Cartesian3} position 待转换点
     * @param {Matrix4} inverseTransform 转换矩阵
     * @return {Cartesian3} 局部坐标系中的点
     */
    #transformPoint(position: Cartesian3, inverseTransform: Matrix4) {
        return Cesium.Matrix4.multiplyByPoint(inverseTransform, position, new Cesium.Cartesian3());
    }
}