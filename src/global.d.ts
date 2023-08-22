import * as C from "cesium";

// 扩展全局变量
declare global {
    // 定义Cesium
    const Cesium: typeof C;
    //扩展 Window
    interface Window {
        Cesium: typeof C;
    }
}
