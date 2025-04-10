import { viewerConfig } from "@/config/earthConfig";
import { Viewer } from "cesium";

/**
 * @description: 初始化viewer
 * @param {string} id domId
 * @param {Viewer.ConstructorOptions} option 配置项
 * @return {Viewer} viewer实例
 */
export function initViewer(id:string, option:Viewer.ConstructorOptions = {}) {
    const o = Object.assign(viewerConfig, option)
    const viewer = new Cesium.Viewer(id, o);
    (<HTMLElement>viewer.cesiumWidget.creditContainer).style.display = "none";
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            window.$config.defaultDestination[0],
            window.$config.defaultDestination[1],
            window.$config.defaultDestination[2],
        ),
        orientation: Cesium.HeadingPitchRoll.fromDegrees(
            window.$config.defaultOrientation[0],
            window.$config.defaultOrientation[1],
            window.$config.defaultOrientation[2],
        )
    });
    createNavigation(viewer);
    return viewer;
}

/**
 * @description: 创建 cesium-navigation
 * @param {Viewer} viewer
 */
function createNavigation(viewer: Viewer){
    const navigation:any = new CesiumNavigation(viewer, {
        // 可接收Rectangle 或 Cartographic, 不传则默认调用camera.flyHome
        defaultResetView: Cesium.Cartographic.fromDegrees(
            window.$config.defaultDestination[0],
            window.$config.defaultDestination[1],
            window.$config.defaultDestination[2],
        ),
        orientation: Cesium.HeadingPitchRoll.fromDegrees(
            window.$config.defaultOrientation[0],
            window.$config.defaultOrientation[1],
            window.$config.defaultOrientation[2],
        ),
        enableCompass: true,    // 启用罗盘
        enableZoomControls: true,   // 启用缩放控件
        enableDistanceLegend: true, // 启用距离图例
        enableCompassOuterRing: true,   // 启用指南针外环
    });
    const distanceDiv = navigation.distanceLegendDiv.querySelector(".distance-legend") as HTMLElement;
    distanceDiv.style.right = "20px";
    distanceDiv.style.backgroundColor = "black";
}