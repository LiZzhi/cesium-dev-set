/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-25 15:33:18
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-25 16:54:07
 * @FilePath: \cesium-secdev-set\src\secdev\dataVisualization\custom\heatMap.ts
 * @Description: 热力图
 */
import { Viewer } from "cesium";
import { CesiumHeatmap, BaseHeatmapConfiguration } from "./cesiumHeatmap"
import { bboxType } from "@/secdev/type";

export type heatMapOptionType = {
    zoomToLayer: boolean;   // 创建后是否自动飞向实体
    cameraListener: boolean;    // 是否开启相机监听
    distance: number;   // 重渲染高度间隔(开启监听才会生效)
    renderType: "primitive" | "imagery" | "entity"; // 创建类型，可选 "primitive" | "imagery" | "entity"
    bounds: bboxType;   // 最大范围
    heatmapOptions: BaseHeatmapConfiguration;   // 热力图配置项
}

export type pointType = {
    x: number;  // 经度
    y: number;  // 纬度
    value?: number; // 值
}

export default class heatMap {
    #viewer:  Viewer;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
    }

    /**
     * @description: 创建热力图
     * @param {pointType} points 点位坐标(角度经纬度)和值
     * @param {number} max 热力最大值(用于对真实值渲染颜色)
     * @param {number} min 热力最小值(用于对真实值渲染颜色)
     * @param {Partial<heatMapOptionType>} options (可选)配置项
     * @return {CesiumHeatmap} 热力图实例
     */
    create(points: pointType[], max: number, min: number, options: Partial<heatMapOptionType>={}){
        let {zoomToLayer, cameraListener, distance, renderType, bounds, heatmapOptions} = Object.assign(this.defaultOptions, options);

        let map = new CesiumHeatmap(this.#viewer, {
            points: points,
            zoomToLayer: zoomToLayer,
            noLisenerCamera: !cameraListener,
            cameraHeightDistance: distance,
            renderType: renderType,
            bounds: [bounds.west, bounds.south, bounds.east, bounds.north],
            heatmapOptions: heatmapOptions,
            heatmapDataOptions: {
                max: max,
                min: min,
            },
        });

        return map
    }

    /**
     * @description: 移除热力图
     * @param {CesiumHeatmap} map 热力图
     * @return {*}
     */
    remove(map: CesiumHeatmap){
        map.remove();
    }

    /**
     * @description: 更新半径
     * @param {CesiumHeatmap} map 热力图
     * @param {number} radius 半径
     * @return {*}
     */
    updateRadius(map: CesiumHeatmap, radius: number){
        map.updateRadius(radius);
    }

    /**
     * @description: 更新热力图配置项
     * @param {CesiumHeatmap} map 热力图
     * @param {BaseHeatmapConfiguration} heatmapOptions 热力图配置项
     * @return {*}
     */
    updateOptions(map: CesiumHeatmap, heatmapOptions: BaseHeatmapConfiguration){
        map.updateHeatmap(heatmapOptions);
    }

    /**
     * @description: 更新最大最小值
     * @param {CesiumHeatmap} map 热力图
     * @param {object} range 最大最小值
     * @return {*}
     */
    updateRange(map: CesiumHeatmap, range: {max?: number, min?: number}){
        map.updateHeatMapMaxMin(range);
    }

    get defaultOptions(){
        return {
            zoomToLayer: false, // 创建后是否自动飞向实体
            cameraListener: true,   // 是否开启相机监听
            distance: 1000, // 重渲染高度间隔(开启监听才会生效)
            renderType: "entity",   // 创建类型，可选 "primitive" | "imagery" | "entity"
            bounds: {
                north: 90,
                east: 180,
                south: -90,
                west: -180
            },
            heatmapOptions: {
                maxOpacity: 1,
                minOpacity: 0
            }
        }
    }
}