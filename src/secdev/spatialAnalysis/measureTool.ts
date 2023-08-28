/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-28 10:20:34
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-28 16:48:24
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\measureTool.ts
 * @Description: 测量工具
 */
import { Cartesian3, CustomDataSource, Viewer } from "cesium";
import drawShape from "../specialEffectPlot/plot/drawShape";
import entityFactory from "../utils/entityFactory";
import getTerrainMostDetailedHeight from "../utils/getTerrainMostDetailedHeight";
import uuid from "../../utils/uuid";

export default class measureTool{
    #viewer: Viewer;
    #measureDataSource: CustomDataSource;
    #draw: drawShape;
    constructor(viewer:Viewer){
        this.#viewer = viewer
        this.#measureDataSource = new Cesium.CustomDataSource(`测量工具-${uuid()}`);
        this.#viewer.dataSources.add(this.#measureDataSource);
        this.#draw = new drawShape(viewer);
    }

    /**
     * @description: 测量高程
     * @return {*}
     */
    measureHeight(){
        this.#draw.drawPoint(async (position: Cartesian3) => {
            let radin = Cesium.Cartographic.fromCartesian(position);
            let heightStr = '计算中...';

            this.#measureDataSource.entities.add(
                entityFactory.createLabelPoint(position, new Cesium.CallbackProperty(()=>heightStr, false))
            )

            let radinArr = await this.#viewer.scene.sampleHeightMostDetailed([radin]);
            if(radinArr.length){
                heightStr = radinArr[0].height.toFixed(3) + 'km';
            }
        })
    }

    /**
     * @description: 测量高差
     * @return {*}
     */
    measureElevationDifference(){
        this.#draw.drawPolyline(async (positions: Cartesian3[]) => {
            let radin = Cesium.Cartographic.fromCartesian(position);
            let heightStr = '计算中...';

            this.#measureDataSource.entities.add(
                entityFactory.createLabelPoint(position, new Cesium.CallbackProperty(()=>heightStr, false))
            )

            let radinArr = await this.#viewer.scene.sampleHeightMostDetailed([radin]);
            if(radinArr.length){
                heightStr = radinArr[0].height.toFixed(3) + 'km';
            }
        })
    }
}