import { viewerConfig, initViewConfig } from "@/config/earthConfig";
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
    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    viewer.camera.setView(initViewConfig);
    return viewer;
}