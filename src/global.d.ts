import * as C from "cesium";
import * as T from "@turf/turf";
import { Viewer } from "cesium";
import heatmap from "@/thirdParty/heatmap/heatmap.js";
import navigation from "@/thirdParty/cesiumNavigation/CesiumNavigation";

type publicConfig = {
    ip: Record<string, string>;
    token: Record<string, string>;
    defaultView: number[];
}

// 扩展全局变量
declare global {
    // 定义Cesium
    const Cesium: typeof C;
    const viewer: Viewer;
    // 定义mapv
    const mapv: any;
    const MapVLayer: any;
    // 定义echartsLayer
    const EchartsLayer: any;
    // 定义turf
    const turf: typeof T;
    // 定义h337, cesiumHeatmap使用
    const h337: typeof heatmap;
    // 定义h337, cesiumHeatmap使用
    const CesiumNavigation: navigation;
    // 全局配置
    const $config: publicConfig;
    //扩展 Window
    interface Window {
        Cesium: typeof C;
        viewer: Viewer;
        mapv: any;
        MapVLayer: any;
        EchartsLayer: any;
        turf: typeof T;
        h337: typeof heatmap;
        CesiumNavigation: navigation;
        $config: publicConfig;
    }
}
