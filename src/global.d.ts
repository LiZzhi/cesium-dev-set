import * as C from "cesium";
import * as T from "@turf/turf";
import { Viewer } from "cesium";
import ip from "~/public/config/ip.json"

type publicConfig = {
    ip: ip;
}

// 扩展全局变量
declare global {
    // 定义Cesium
    const Cesium: typeof C;
    const viewer: Viewer;
    // 定义mapv
    const mapv: any;
    const MapVLayer: any;
    // 定义turf
    const turf: typeof T;
    // 全局配置
    const $config: publicConfig;
    //扩展 Window
    interface Window {
        Cesium: typeof C;
        viewer: Viewer;
        mapv: any;
        MapVLayer: any;
        turf: typeof T;
        $config: publicConfig;
    }
}
