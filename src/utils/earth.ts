import { viewerConfig } from "@/config/earthConfig";
import { Viewer, ScreenSpaceEventHandler } from "cesium";

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
    pickPosition(viewer);
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

/**
 * @description: 拾取坐标打印在控制台
 * @param {Viewer} viewer
 * @return {*}
 */
function pickPosition(viewer: Viewer) {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e: any) => {
        let depth = viewer.scene.globe.depthTestAgainstTerrain
        viewer.scene.globe.depthTestAgainstTerrain = true;
        let ray = viewer.camera.getPickRay(e.position);//获取一条射线
        if (ray) {
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            if (position) {
                let radians = Cesium.Cartographic.fromCartesian(position);
                let degrees = [
                    Cesium.Math.toDegrees(radians.longitude),
                    Cesium.Math.toDegrees(radians.latitude),
                    radians.height
                ];
                console.log("笛卡尔坐标:", position);
                console.log("经纬度坐标:", degrees);
            }
            console.log("当前视角", {
                destination: viewer.camera.position,
                orientation: new Cesium.HeadingPitchRoll(
                    viewer.camera.heading,
                    viewer.camera.pitch,
                    viewer.camera.roll
                )
            });
        viewer.scene.globe.depthTestAgainstTerrain = depth;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}