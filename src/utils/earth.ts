import { viewerConfig, initViewConfig } from "@/config/earthConfig";
import { Viewer } from "cesium";
import CesiumNavigation from 'cesium-navigation-es6'

/**
 * @description: 初始化viewer
 * @param {string} id domId
 * @param {Viewer.ConstructorOptions} option 配置项
 * @return {Viewer} viewer实例
 */
export function initViewer(id:string, option:Viewer.ConstructorOptions = {}) {
    const o = Object.assign(viewerConfig, option)
    const viewer = new Cesium.Viewer(id, o);
    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    viewer.camera.setView(initViewConfig);
    createNavigation(viewer);
    return viewer;
}

/**
 * @description: 创建 cesium-navigation
 * @param {Viewer} viewer
 */
function createNavigation(viewer: Viewer){
    const navigation:any = new CesiumNavigation(viewer, {
        // defaultResetView: Cesium.Cartographic.fromCartesian(initViewConfig.destination);, // 默认视图 Cartographic 或 Rectangle
        enableCompass: true,    // 启用罗盘
        enableZoomControls: true,   // 启用缩放控件
        enableDistanceLegend: true, // 启用距离图例
        enableCompassOuterRing: true,   // 启用指南针外环
    });
    const distanceDiv = navigation.distanceLegendDiv.querySelector(".distance-legend") as HTMLElement;
    distanceDiv.style.right = "20px";
    distanceDiv.style.backgroundColor = "black";
}