/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-27 10:12:19
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-23 10:53:21
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\surfaceExcavateAnalysis.ts
 * @Description: 地形开挖
 */
import { Cartesian3, Viewer, ClippingPlane, Entity, Cartographic } from "cesium";
import booleanClockwise from "../utils/booleanClockwise";
import equidistantInterpolation from "../utils/equidistantInterpolation";
import surfaceExcavate from "./surfaceExcavate";

export type excavateOptionType = {
    depth: number;  // 开挖深度, 默认200
    bottomImage: string;    // 底部贴图
    sideImage: string;  // 侧面贴图
    clampToGround: boolean; // 是否贴地, 默认false
    lerpDistance: number;   //贴地时插值距离, 默认为50
}

export default class surfaceExcavateAnalysis {
    #viewer: Viewer;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
    }

    /**
     * @description: 创建开挖
     * @param {Cartesian3[]} positions 位置
     * @param {Partial<excavateOptionType>} options 配置项
     * @return {surfaceExcavate}
     */
    async create(positions: Cartesian3[], options: Partial<excavateOptionType>={}){
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
        let entity = await this.#createEntity(positions, o);
        this.#viewer.entities.add(entity);

        let surface = new surfaceExcavate(this.#viewer, entity, positions, o.depth, o.clampToGround);
        return surface;
    }

    remove(surface: surfaceExcavate){
        this.#viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: []
        });
        this.#viewer.entities.remove(surface.entity);
    }

    async #createEntity(positions: Cartesian3[], options: excavateOptionType){
        if (!positions[0].equals(positions[positions.length-1])) {
            positions.push(positions[0]);
        }
        if (options.clampToGround) {
            // 贴地情况对地形进行插值
            positions = await this.#computedLerp(positions, options.lerpDistance);
            if (!positions[0].equals(positions[positions.length-1])) {
                positions.push(positions[0]);
            }
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
     * @description: 计算插值，用来贴地
     * @return {Cartesian3[]}
     */
    async #computedLerp(positions: Cartesian3[], lerpDistance: number){
        let catArr2: Cartographic[][] = [];
        for (let i = 1; i < positions.length; i++) {
            let start: Cartesian3 = positions[i - 1];
            let end: Cartesian3 = positions[i];
            let cat = equidistantInterpolation(start, end, lerpDistance);
            cat = await Cesium.sampleTerrainMostDetailed(this.#viewer.terrainProvider, cat);
            catArr2.push(cat);
        }

        let catArr = catArr2.flat();
        let c3Arr: Cartesian3[] = [];
        catArr.forEach(v=>{
            let c = Cesium.Cartesian3.fromRadians(v.longitude, v.latitude, v.height);
            c3Arr.push(c)
        })
        return c3Arr;
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
            clampToGround: false,
            lerpDistance: 50,
        }
    }
}