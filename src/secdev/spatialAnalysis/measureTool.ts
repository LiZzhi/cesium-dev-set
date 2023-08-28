/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-28 10:20:34
 * @LastEditors: “Lizhi” “362042734@qq.com”
 * @LastEditTime: 2023-08-28 23:10:19
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\measureTool.ts
 * @Description: 测量工具
 */
import { Cartesian3, Cartographic, CustomDataSource, Viewer, Entity } from "cesium";
import drawShape from "../specialEffectPlot/plot/drawShape";
import entityFactory from "../utils/entityFactory";
import * as turf from "@turf/turf";
import cartographicTool from "../utils/cartographicTool";
import getTerrainMostDetailedHeight from "../utils/getTerrainMostDetailedHeight";
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
        this.#draw.drawPoint(async (position: Cartesian3) => {
            let radin = Cesium.Cartographic.fromCartesian(position);
            let heightStr = '计算中...';

            let e = this.#measureDataSource.entities.add(
                entityFactory.createLabelPoint(position, new Cesium.CallbackProperty(()=>heightStr, false))
            )
            this.#measureCollection.push([e]);

            let radinArr = await this.#viewer.scene.sampleHeightMostDetailed([radin]);
            if(radinArr.length){
                heightStr = radinArr[0].height.toFixed(3) + 'km';
            }
        })
    }

    /**
     * @description: 测量直线距离
     * @return {*}
     */
    measureStraightDistance(){
        this.#draw.drawPolyline(async (positions: Cartesian3[]) => {
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
                const distanceText = distanceNum > 1000 ? (distanceNum / 1000).toFixed(3) + 'km' : distanceNum.toFixed(3) + 'm';
                // 添加label
                es.push(this.#measureDataSource.entities.add(entityFactory.createLabel(centerPosition, distanceText)));
                // 添加节点
                es.push(this.#measureDataSource.entities.add(entityFactory.createPoint(positions[i])))
            }
            // 添加线段
            es.push(this.#measureDataSource.entities.add(entityFactory.createStraightPolyline(positions)));
            this.#measureCollection.push(es);
        })
    }
}