/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-09-15 13:56:28
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-09-15 14:25:55
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\geoGrid.ts
 * @Description: 地理网格
 */
import type { voidFuncType } from "@/type/common";
import { Viewer, ScreenSpaceEventHandler, ImageryProvider, ImageryLayer, Entity } from "cesium";

export default class imageryGrid{
    #viewer: Viewer;
    #handler: ScreenSpaceEventHandler|undefined;
    #gridImagery: ImageryProvider;
    #gridImageryLayer: ImageryLayer|undefined;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        this.#gridImagery = new Cesium.GridImageryProvider({
            backgroundColor: Cesium.Color.TRANSPARENT,
            color: Cesium.Color.WHITE,
            glowWidth: 0,
            cells: 1,
        });
        this.#gridImageryLayer = undefined;
        this.#handler = undefined;
    }

    /**
     * @description: 创建网格图层
     * @param {voidFuncType} clickEvent (可选)是否需要点击事件
     * @return {*}
     */
    init(clickEvent?: voidFuncType) {
        if (!this.#gridImageryLayer) {
            // 网格图层
            this.#gridImageryLayer = this.#viewer.imageryLayers.addImageryProvider(this.#gridImagery);
            //将图层置顶
            this.#viewer.imageryLayers.raiseToTop(this.#gridImageryLayer);
        }
        if(!this.#handler && typeof clickEvent === "function"){
            this.#addEvent(clickEvent);
        }
    }

    /**
     * @description: 移除网格图层
     * @return {*}
     */
    remove() {
        if (this.#handler) {
            this.#handler.removeInputAction(
                Cesium.ScreenSpaceEventType.LEFT_CLICK
            );
            this.#handler.destroy();
            this.#handler = undefined;
        }
        if (this.#gridImageryLayer) {
            this.#viewer.imageryLayers.remove(this.#gridImageryLayer);
            this.#gridImageryLayer = undefined;
        }
    }

    /**
     * @description: 点击事件
     * @param {voidFuncType} callback 回调函数，接受一个参数，参数类型为 Rectangle，表示当前位置网格矩形
     * @return {*}
     */
    #addEvent(callback?: voidFuncType) {
        if(typeof callback === "function"){
            this.#handler = new Cesium.ScreenSpaceEventHandler(this.#viewer.scene.canvas);
            this.#handler.setInputAction((e:any) => {
                let globe: any = this.#viewer.scene.globe;
                let level: number = globe._surface._tilesToRender[0]._level;    // 瓦片层级
                let pickPosition = this.#viewer.scene.camera.pickEllipsoid(e.position, this.#viewer.scene.globe.ellipsoid);
                if(pickPosition){
                    let cartographic = Cesium.Cartographic.fromCartesian(pickPosition);
                    let xy = this.#gridImagery.tilingScheme.positionToTileXY(cartographic, level);  // 获取瓦片 XY 编号
                    // 根据瓦片 XY 编号和层级获取矩形
                    let rectangle = this.#gridImagery.tilingScheme.tileXYToRectangle(xy.x, xy.y, level);
                    callback(rectangle);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
}