/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-06-21 13:38:51
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-06-24 20:12:11
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\wind\wind3D2.ts
 * @Description: 风场特效2，基于 https://github.com/sakitam-fdd/wind-layer 项目完成，使用设置(windOptions)及数据(data)与原项目一致。
 */
import { Viewer } from "cesium";
import {
    defaultOptions,
    Field,
    formatData,
    removeDomNode,
    WindCore,
    IOptions,
} from "wind-core";
import isVisible from "@/secdev/utils/isOnBack";

export default class {
    viewer: Viewer;
    canvas: HTMLCanvasElement;
    wind: WindCore | undefined;
    field: Field | undefined;
    options: IOptions;
    constructor(viewer: Viewer, data: any, options: Partial<IOptions> = {}) {
        this.viewer = viewer;
        this.canvas = document.createElement("canvas");
        this.wind = undefined;
        this.field = undefined;
        this.options = Object.assign(defaultOptions, options);

        this.canvas.style.cssText =
            "position:absolute; left:0; top:0;user-select:none;pointer-events: none;";
        this.canvas.className = "cesium-wind-j";

        if (data) {
            this.setData(data);
        }
    }

    init() {
        this.appendCanvas();
        this.render(this.canvas);
    }

    setVisible(show: boolean){
        this.canvas.style.display = show ? "block" : "none";
    }

    remove() {
        if (!this.viewer) {
            return;
        }
        if (this.wind) {
            this.wind.stop();
        }
        if (this.canvas) {
            removeDomNode(this.canvas);
        }
    }

    removeLayer() {
        this.remove();
    }

    setData(data: any) {
        if (data && data.checkFields && data.checkFields()) {
            this.field = data;
        } else if (Array.isArray(data)) {
            this.field = formatData(data);
        } else {
            console.error("Illegal data");
        }

        if (this.viewer && this.canvas && this.field) {
            this.wind?.updateData(this.field);
            this.appendCanvas();
            this.render(this.canvas);
        }

        return this;
    }

    getData() {
        return this.field;
    }

    getWindOptions() {
        return this.options;
    }

    getContext() {
        if (this.canvas === null) {
            return;
        }
        return this.canvas?.getContext("2d");
    }

    appendCanvas() {
        if (!this.viewer || !this.canvas) {
            return;
        }
        if (document.querySelector(".cesium-wind-j")) {
            return;
        }
        this.adjustSize();
        const cesiumWidget = this.viewer.canvas.parentNode;
        cesiumWidget!.appendChild(this.canvas);
    }

    adjustSize() {
        const viewer = this.viewer;
        const canvas = this.canvas;
        const { width, height } = viewer.canvas;
        const devicePixelRatio = 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }

    render(canvas: HTMLCanvasElement) {
        if (!this.getData() || !this.viewer) {
            return this;
        }
        const opt = this.getWindOptions();
        if (canvas && !this.wind) {
            const data = this.getData();

            const ctx = this.getContext();

            if (ctx) {
                this.wind = new WindCore(ctx, opt, data);
                // @ts-ignore
                this.wind.project = this.project.bind(this);
                // @ts-ignore
                this.wind.unproject = this.unproject.bind(this);
                this.wind.intersectsCoordinate =
                    this.intersectsCoordinate.bind(this);
                this.wind.postrender = () => {};
            }
        }

        if (this.wind) {
            this.wind.prerender();
            this.wind.render();
        }

        return this;
    }

    project(coordinate: any) {
        const position = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]);
        const scene = this.viewer.scene;
        const sceneCoor = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            scene,
            position
        );
        return [sceneCoor?.x, sceneCoor?.y];
    }

    unproject(pixel: number[]) {
        const viewer = this.viewer;
        const pick = new Cesium.Cartesian2(pixel[0], pixel[1]);
        const cartesian = viewer.scene.globe.pick(
            viewer.camera.getPickRay(pick)!,
            viewer.scene
        );

        if (!cartesian) {
            return null;
        }

        const ellipsoid = viewer.scene.globe.ellipsoid;
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        return [lng, lat];
    }

    intersectsCoordinate(coordinate: any) {
        const camera = this.viewer.camera;
        const point = Cesium.Cartesian3.fromDegrees(
            coordinate[0],
            coordinate[1]
        );
        return isVisible(camera.position, point)
    }
}
