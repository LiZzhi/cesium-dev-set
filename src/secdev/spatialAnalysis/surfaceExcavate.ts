/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-27 10:12:19
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-27 11:34:09
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\surfaceExcavate.ts
 * @Description: 地形开挖
 */
import { Cartesian3, Viewer, ClippingPlane, Entity } from "cesium";
import booleanClockwise from "../utils/booleanClockwise";

export type excavateOptionType = {
    depth: number;  // 开挖深度
    bottomImage: string;    // 底部贴图
    sideImage: string;  // 侧面贴图
}

export default class surfaceExcavate {
    #viewer: Viewer;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
    }

    create(positions: Cartesian3[], options: Partial<excavateOptionType>={}){
        let o = Object.assign(this.defaultOptions, options);
        positions = Cesium.clone(positions);
        let bClockwise = booleanClockwise(positions);   // 判断点顺序是否为顺时针
        if (bClockwise) {
            //顺时针 需要转换点的顺序
            positions = positions.reverse();
        }

        let length = positions.length;
        let plans: ClippingPlane[] = [];
        for (let i = 1; i < length; i++) {
            let plane = this.#createPlane(positions[i-1], positions[i]);
            plans.push(plane);
        }
        let plane = this.#createPlane(positions[length-1], positions[0]);
        plans.push(plane);

        this.#viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: plans,
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.WHITE
        });

        let entity = this.#createEntity(positions, o);
        this.#viewer.entities.add(entity);
        return entity;
    }

    remove(entity: Entity){
        this.#viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: []
        });
        this.#viewer.entities.remove(entity);
    }

    #createEntity(positions: Cartesian3[], options: excavateOptionType){
        if (!positions[0].equals(positions[positions.length-1])) {
            positions.push(positions[0]);
        }
        let hierarchy = new Cesium.PolygonHierarchy(positions);
        let {bottomImage, sideImage, depth} = options;
        let e = new Cesium.Entity({
            polygon: {
                hierarchy: hierarchy,
                material: new Cesium.ImageMaterialProperty({
                    image: bottomImage
                }),
                height: -depth,
                // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            },
            wall: {
                positions: hierarchy.positions,
                minimumHeights: hierarchy.positions.map(()=>-depth),
                material: new Cesium.ImageMaterialProperty({
                    image: sideImage
                }),
            }
        })
        return e;
    }

    /**
     * @description: 构造ClippingPlane
     * @param {Cartesian3} startPosition 起点
     * @param {Cartesian3} endPosition 终点
     * @return {ClippingPlane} ClippingPlane
     */
    #createPlane(startPosition: Cartesian3, endPosition: Cartesian3) {
        let midpoint = Cesium.Cartesian3.add(startPosition, endPosition, new Cesium.Cartesian3());
        midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

        let up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
        let right = Cesium.Cartesian3.subtract(endPosition, startPosition, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(right, right);
        let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(normal, normal);

        let originCenteredPlane = new Cesium.Plane(normal, 0.0);
        let distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
        return new Cesium.ClippingPlane(normal, distance);
    }

    get defaultOptions(): excavateOptionType{
        return {
            depth: 200,
            bottomImage: require("../assets/img/surfaceExcavate/excavate_bottom_min.jpg"),
            sideImage: require("../assets/img/surfaceExcavate/excavate_side_min.jpg"),
        }
    }
}