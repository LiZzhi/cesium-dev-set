/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-23 10:43:57
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-24 16:46:40
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\surfaceExcavate.ts
 * @Description: 地形开挖对象
 */
import { Cartesian3, Entity, Viewer, Geometry } from "cesium";

export default class surfaceExcavate{
    #viewer: Viewer;
    entity: Entity;
    positions: Cartesian3[];
    depth: number;
    clampToGround: boolean;
    constructor(viewer: Viewer, entity: Entity, positions: Cartesian3[], depth: number, clampToGround: boolean){
        this.#viewer = viewer;
        this.entity = entity;
        this.positions = positions;
        this.depth = depth;
        this.clampToGround = clampToGround;
    }

    /**
     * @description: 计算方量
     * @return {*}
     */
    computeCutVolume() {
        let catArr: number[][][] = [[]];
        this.positions.forEach(c => {
            let cat = Cesium.Cartographic.fromCartesian(c);
            catArr[0].push([Cesium.Math.toDegrees(cat.longitude), Cesium.Math.toDegrees(cat.latitude)]);
        })
        let area = turf.area(turf.polygon(catArr));
        // 地下体积
        let subsurfaceVolume = area * this.depth;
        if (!this.clampToGround) {
            // 无地形情况
            return subsurfaceVolume;
        }

        let tileAvailability = this.#viewer.terrainProvider.availability;
        let maxLevel = 0;
        let minHeight = 15000;
        // 计算差值点
        for (let i = 0; i < this.positions.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(this.positions[i]);
            let height: number = this.#viewer.scene.globe.getHeight(cartographic)!;

            if (minHeight > height){
                minHeight = height;
            }

            let level = tileAvailability.computeMaximumLevelAtPosition(cartographic);

            if (maxLevel < level)
                maxLevel = level;
        }

        let granularity = Math.PI / Math.pow(2, 11);
        granularity = granularity / (64);
        let polygonGeometry = Cesium.PolygonGeometry.fromPositions(
            {
                positions: this.positions,
                vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
                granularity: granularity
            }
        );

        let geom: Geometry = Cesium.PolygonGeometry.createGeometry(polygonGeometry)!;
        let totalCutVolume = 0;

        let i0, i1, i2;
        let height1, height2, height3;
        let bottomP1, bottomP2, bottomP3;
        let scratchCartesian = new Cesium.Cartesian3();
        let cartographic;
        let bottomArea;
        let subTrianglePositions;


        for (let i = 0; i < geom.indices.length; i += 3) {
            i0 = geom.indices[i];
            i1 = geom.indices[i + 1];
            i2 = geom.indices[i + 2];

            subTrianglePositions = geom.attributes.position.values;

            scratchCartesian.x = subTrianglePositions[i0 * 3];
            scratchCartesian.y = subTrianglePositions[i0 * 3 + 1];
            scratchCartesian.z = subTrianglePositions[i0 * 3 + 2];

            cartographic = Cesium.Cartographic.fromCartesian(scratchCartesian);

            height1 = this.#viewer.scene.globe.getHeight(cartographic)!;

            bottomP1 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            scratchCartesian.x = subTrianglePositions[i1 * 3];
            scratchCartesian.y = subTrianglePositions[i1 * 3 + 1];
            scratchCartesian.z = subTrianglePositions[i1 * 3 + 2];

            cartographic = Cesium.Cartographic.fromCartesian(scratchCartesian);

            height2 = this.#viewer.scene.globe.getHeight(cartographic)!;

            bottomP2 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            scratchCartesian.x = subTrianglePositions[i2 * 3];
            scratchCartesian.y = subTrianglePositions[i2 * 3 + 1];
            scratchCartesian.z = subTrianglePositions[i2 * 3 + 2];

            cartographic = Cesium.Cartographic.fromCartesian(scratchCartesian);

            height3 = this.#viewer.scene.globe.getHeight(cartographic)!;

            bottomP3 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            bottomArea = this.#computeAreaOfTriangle(bottomP1, bottomP2, bottomP3);
            totalCutVolume = totalCutVolume + bottomArea * (height1 - minHeight + height2 - minHeight + height3 - minHeight) / 3;
        }

        return totalCutVolume + subsurfaceVolume;
    }

    /**
     * @description: 计算三角形的面积
     * @return {*}
     */
    #computeAreaOfTriangle(pos1: Cartesian3, pos2: Cartesian3, pos3: Cartesian3) {
        let a = Cesium.Cartesian3.distance(pos1, pos2);
        let b = Cesium.Cartesian3.distance(pos2, pos3);
        let c = Cesium.Cartesian3.distance(pos3, pos1);

        let S = (a + b + c) / 2;

        return Math.sqrt(S * (S - a) * (S - b) * (S - c));
    }


}