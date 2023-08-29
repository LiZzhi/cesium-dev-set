/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-28 10:20:34
 * @LastEditors: “Lizhi” “362042734@qq.com”
 * @LastEditTime: 2023-08-29 21:07:53
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\measureTool.ts
 * @Description: 测量工具
 */
import { Cartesian3, Cartographic, CustomDataSource, Viewer, Entity } from "cesium";
import drawShape from "../specialEffectPlot/plot/drawShape";
import entityFactory from "../utils/entityFactory";
import * as turf from "@turf/turf";
import equidistantInterpolation from "../utils/equidistantInterpolation";
import uuid from "../../utils/uuid";

export default class measureTool{
    #viewer: Viewer;
    #measureDataSource: CustomDataSource;
    #draw: drawShape;
    #measureCollection: Entity[][];
    constructor(viewer:Viewer){
        this.#viewer = viewer
        this.#measureDataSource = new Cesium.CustomDataSource(`测量工具-${uuid()}`);
        this.#viewer.dataSources.add(this.#measureDataSource);
        this.#draw = new drawShape(viewer);
        this.#measureCollection = [];
    }

    /**
     * @description: 测量高程
     * @return {*}
     */
    measureHeight(){
        this.#draw.drawPoint((position) => {
            let radin = Cesium.Cartographic.fromCartesian(position);
            let heightStr = '计算中...';

            let e = this.#measureDataSource.entities.add(
                entityFactory.createLabelPoint(position, new Cesium.CallbackProperty(()=>heightStr, false))
            )
            this.#measureCollection.push([e]);

            Cesium.sampleTerrainMostDetailed(this.#viewer.terrainProvider, [radin]).then(radinArr=>{
                const height = radinArr[0].height;
                heightStr = "高程:" + (height > 1000 ? (height / 1000).toFixed(3) + 'km' : height.toFixed(3) + 'm');
            });
        })
    }

    /**
     * @description: 测量高差
     * @return {*}
     */
    measureHeightDifference(){
        this.#draw.drawCircle((positions, distance) => {
            let startRadin = Cesium.Cartographic.fromCartesian(positions[0]);
            let endRadin = Cesium.Cartographic.fromCartesian(positions[1]);
            let heightPosition = Cesium.Cartesian3.fromRadians(
                startRadin.longitude,
                startRadin.latitude,
                endRadin.height
            )
            const height = endRadin.height - startRadin.height;
            const heightStr = "高差:" + (Math.abs(height) > 1000 ? (height / 1000).toFixed(3) + 'km' : height.toFixed(3) + 'm');
            let e1 = entityFactory.createPoint(positions[0]);
            let e2 = entityFactory.createStraightPolyline([positions[0], heightPosition]);
            let e3 = entityFactory.createHeightCircle(positions[0], distance, endRadin.height);
            let e4 = entityFactory.createLabelPoint(
                Cesium.Cartesian3.fromRadians(startRadin.longitude, startRadin.latitude, endRadin.height),
                heightStr
            );
            const es = [e1, e2, e3, e4];
            this.#measureCollection.push(es);
            es.forEach(v => {
                this.#measureDataSource.entities.add(v);
            })
        }, {
            clampToGround: false,
        })
    }

    /**
     * @description: 测量贴地距离
     * @param { number } interval (可选)插值间隔(米),越小越精准,但计算量越大,建议根据实际距离来配置,默认为1m
     * @return {*}
     */
    measureClampDistance(interval: number=1){
        this.#draw.drawPolyline(async (positions) => {
            const es:Entity[] = [];

            let lastPosition: Cartesian3 = positions[0];
            // 添加第一个节点
            es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(lastPosition)))
            for (let i = 1; i < positions.length; i++) {
                const startPosition = lastPosition;
                const endPosition = positions[i];
                lastPosition = endPosition;

                let distanceStr = '计算中...';
                // 计算label位置
                const centerPosition = new Cesium.Cartesian3();
                Cesium.Cartesian3.midpoint(startPosition, endPosition, centerPosition);
                // 添加label
                es.push(this.#measureDataSource.entities.add(entityFactory.createLabel(
                    centerPosition,
                    new Cesium.CallbackProperty(()=>distanceStr, false)
                )));
                // 添加节点
                es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(positions[i])))
                // 插值结果
                const interpolationPositions = equidistantInterpolation(startPosition, endPosition, interval);
                Cesium.sampleTerrainMostDetailed(this.#viewer.terrainProvider, interpolationPositions).then(catArr => {
                    let sumDistance = 0;
                    let lastCat = catArr[0];
                    for (let j = 1; j < catArr.length; j++) {
                        const startCat = lastCat;
                        const endCat = catArr[j];
                        lastCat = endCat;
                        sumDistance += Cesium.Cartesian3.distance(
                            Cesium.Cartesian3.fromRadians(startCat.longitude, startCat.latitude, startCat.height, this.#viewer.scene.globe.ellipsoid),
                            Cesium.Cartesian3.fromRadians(endCat.longitude, endCat.latitude, endCat.height, this.#viewer.scene.globe.ellipsoid)
                        );
                    }
                    distanceStr = "贴地距离:" + (sumDistance > 1000 ? (sumDistance / 1000).toFixed(3) + 'km' : sumDistance.toFixed(3) + 'm');
                })
            }
            // 添加线段
            es.push(this.#measureDataSource.entities.add(entityFactory.createPolyline(positions)));
            this.#measureCollection.push(es);
        })
    }

    /**
     * @description: 测量直线距离
     * @return {*}
     */
    measureStraightDistance(){
        this.#draw.drawPolyline(async (positions) => {
            const es:Entity[] = [];

            let lastPosiCat: Cartesian3 = positions[0];
            // 添加第一个节点
            es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(lastPosiCat)))
            for (let i = 1; i < positions.length; i++) {
                const startPosition = lastPosiCat;
                const endPosition = positions[i];
                lastPosiCat = endPosition;
                // 计算label位置
                const centerPosition = new Cesium.Cartesian3();
                Cesium.Cartesian3.midpoint(startPosition, endPosition, centerPosition);
                // 计算距离
                const distanceNum = Cesium.Cartesian3.distance(startPosition, endPosition);
                const distanceText = "直线距离:" + (distanceNum > 1000 ? (distanceNum / 1000).toFixed(3) + 'km' : distanceNum.toFixed(3) + 'm');
                // 添加label
                es.push(this.#measureDataSource.entities.add(entityFactory.createLabel(centerPosition, distanceText)));
                // 添加节点
                es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(positions[i])))
            }
            // 添加线段
            es.push(this.#measureDataSource.entities.add(entityFactory.createStraightPolyline(positions)));
            this.#measureCollection.push(es);
        }, {
            clampToGround: false,
        })
    }

    /**
     * @description: 测量多边形面积
     * @return {*}
     */
    measureArea(){
        this.#draw.drawPolygon(async (positions) => {
            const es:Entity[] = [];
            const catArr: number[][] = [];
            let areaStr = "计算中";
            es.push(this.#measureDataSource.entities.add(entityFactory.createPloygon(positions)));
            for (let i = 0; i < positions.length; i++) {
                if (i === 0) {
                    // 因为中点高度不好弄,尤其测量3dtile时候,所以直接放在第一点上了
                    es.push(this.#measureDataSource.entities.add(
                        entityFactory.createLabelPoint(positions[i], new Cesium.CallbackProperty(() => areaStr, false))
                    ));
                } else{
                    es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(positions[i])));
                }
                let cat = Cesium.Cartographic.fromCartesian(positions[i]);
                catArr.push([Cesium.Math.toDegrees(cat.longitude), Cesium.Math.toDegrees(cat.latitude)])
            }
            // 计算面积
            const area = turf.area({
                type: 'Polygon',
                coordinates: [catArr]
            });
            areaStr = "面积:" + (area < 100000?(area.toFixed(3)+'m²'):((area/100000).toFixed(3)+'km²'));
            this.#measureCollection.push(es);
        })
    }

    revoke(){
        const entities = this.#measureCollection.pop();
        if(entities){
            for (let i = 0; i < entities.length; i++) {
                this.#measureDataSource.entities.remove(entities[i]);
            }
            return true;
        } else {
            return false;
        }
    }

    removeAll(){
        while (this.revoke());
    }
}