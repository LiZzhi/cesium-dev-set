import * as C from "cesium";
import { Viewer } from "cesium";

// 扩展全局变量
declare global {
    // 定义Cesium
    const Cesium: typeof C;
    const viewer: Viewer;
    // 定义mapv
    const mapv: any;
    const MapVLayer: any;
    //扩展 Window
    interface Window {
        Cesium: typeof C;
        viewer: Viewer;
        mapv: any;
        MapVLayer: any;
    }
}
