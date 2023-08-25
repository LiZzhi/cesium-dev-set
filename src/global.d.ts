import * as C from "cesium";
import { Viewer } from "cesium";

// 扩展全局变量
declare global {
    // 定义Cesium
    const Cesium: typeof C;
    const viewer: Viewer;
    //扩展 Window
    interface Window {
        Cesium: typeof C;
        viewer: Viewer;
    }
}
