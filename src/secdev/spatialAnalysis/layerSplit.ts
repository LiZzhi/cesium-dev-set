/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-24 18:21:26
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-24 18:35:50
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\layerSplit.ts
 * @Description: 卷帘
 */
import {
    Viewer,
    ImageryLayer,
    ImageryProvider,
    ImagerySplitDirection,
    ScreenSpaceEventHandler,
} from "cesium";

export default class layerSplit {
    #viewer: Viewer;
    #baseLayer: ImageryLayer | null; // 初始图层
    #slider: HTMLElement; // 卷帘滑动块
    #splitDirection: ImagerySplitDirection; // 窗口方向
    #handler: ScreenSpaceEventHandler | null;
    #isInit: boolean;

    /**
     * 创建卷帘图层
     * @param {Viewer} viewer
     * @param {ImageryProvider} baseLayer 初始图层
     * @param {ImagerySplitDirection} splitDirection 卷帘窗口
     */
    constructor(
        viewer: Viewer,
        baseLayer: ImageryProvider,
        splitDirection: ImagerySplitDirection
    ) {
        this.#viewer = viewer;
        this.#splitDirection = splitDirection;
        this.#baseLayer = viewer.imageryLayers.addImageryProvider(baseLayer);
        this.#baseLayer.splitDirection = splitDirection;
        this.#slider = document.createElement("div");
        this.#handler = null;
        this.#isInit = false;
    }

    /**
     * 初始化卷帘
     */
    create(): void {
        if (this.#isInit){
            return;
        }
        this.#isInit = true;

        let sliderInWindow: HTMLElement | null = document.getElementById(
            "cesium-image-layer-split"
        );

        if (sliderInWindow) {
            this.#slider = sliderInWindow;
        } else {
            this.#slider.id = "cesium-image-layer-split";
            this.#viewer.cesiumWidget.container.appendChild(this.#slider);
        }

        // 第二次实例化时将 display none 去掉
        this.#slider.style.display = "";
        this.#slider.style.position = "absolute";
        this.#slider.style.top = "0";
        this.#slider.style.left = "49.9%";
        this.#slider.style.width = "0.2%";
        this.#slider.style.height = "100%";
        this.#slider.style.cursor = "move";
        this.#slider.style.backgroundColor = "white";
        this.#registEvent(this.#slider);

        this.#viewer.scene.imagerySplitPosition = 0.5;
    }

    /**
     * 销毁
     */
    destory(): void {
        if (!this.#isInit){
            return;
        }
        this.#isInit = false;

        if (this.#baseLayer) {
            this.#viewer.imageryLayers.remove(this.#baseLayer);
        }

        if (this.#slider) {
            this.#slider.style.display = "none";
        }

        this.#handler && this.#handler.destroy();
        this.#isInit = false;
    }

    /**
     * 将图层更改至当前窗口中
     * @param {ImageryLayer} layer 图层
     * @returns 修改后的图层
     */
    changeLayer(layer: ImageryLayer) {
        layer.splitDirection = this.#splitDirection;
        return layer;
    }

    /**
     * 获取当前窗口方向
     * @returns {ImagerySplitDirection} 窗口方向
     */
    get splitDirection(): ImagerySplitDirection {
        return this.#splitDirection;
    }

    /**
     * 获取当前窗口底图
     * @returns {ImageryLayer|null} 底图
     */
    get baseLayer(): ImageryLayer | null {
        return this.#baseLayer;
    }

    /**
     * 获取当前窗口中所有的图层
     * @returns {ImageryLayer[]} 图层数组
     */
    get layerCollection(): ImageryLayer[] {
        // @ts-ignore
        let layers: ImageryLayer[] = this.#viewer.imageryLayers._layers;
        let splitLayers = layers.filter(
            (v) => v.splitDirection === this.#splitDirection
        );
        return splitLayers;
    }

    /**
     * 卷帘左右滑动事件
     * @param slider
     */
    #registEvent(slider: HTMLElement): void {
        let handler = new Cesium.ScreenSpaceEventHandler(
            slider as HTMLCanvasElement
        );
        let moveActive = false; // 是否允许卷帘滑动

        handler.setInputAction(() => {
            moveActive = true;
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction((e: any) => {
            if (!moveActive) {
                return;
            }

            let splitPosition =
                (slider.offsetLeft + e.endPosition.x) /
                slider.parentElement!.offsetWidth;
            slider.style.left = 100.0 * splitPosition + "%";
            this.#viewer.scene.imagerySplitPosition = splitPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(() => {
            moveActive = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        this.#handler = handler;
    }
}
