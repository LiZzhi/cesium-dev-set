/*
 * @Author: “Lizhi” “362042734@qq.com”
 * @Date: 2023-09-07 21:17:29
 * @LastEditors: “Lizhi” “362042734@qq.com”
 * @LastEditTime: 2023-09-07 22:46:47
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\eagleEyeView.ts
 * @Description: ol鹰眼地图
 */

import { Viewer } from "cesium";
import olMap from "ol/Map";
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import XYZSource from "ol/source/XYZ"
import Style from "ol/style/Style"
import Stroke from "ol/style/Stroke"
import Fill from "ol/style/Fill"
import View from "ol/View"
import Feature from "ol/Feature"
import Polygon from "ol/geom/Polygon"
import { isEmpty } from "ol/extent";
import { defaults } from "ol/control/defaults"

export default class eagleEyeView{
    #viewer: Viewer;
    #olmapDom: HTMLElement;
    #map: olMap|undefined;
    #activateContainer: "viewer"|"ol"|"";
    #feature: Feature;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
        this.#olmapDom = document.createElement('div');
        this.#map = undefined;
        this.#activateContainer = "";
        this.#feature = new Feature(
            new Polygon([
                [
                    [75, 20],
                    [75, 40],
                    [120, 40],
                    [120, 20],
                    [75, 20]
                ]
        ]))
    }

    init(root: HTMLElement){
        this.#createDom(root);
        this.#createOlMap(this.#olmapDom);
        this.#viewer.scene.postRender.addEventListener(this.#syncEvent, this);
        this.#activate();
    }

    #syncEvent(){
        if (this.#activateContainer !== 'viewer') return;
        let rec = this.#viewer.camera.computeViewRectangle();
        if (!rec) {
            // console.log('rec is undefined');
            return;
        }
        let extent = [
            Cesium.Math.toDegrees(rec.west),
            Cesium.Math.toDegrees(rec.south),
            Cesium.Math.toDegrees(rec.east),
            Cesium.Math.toDegrees(rec.north)
        ];
        if (isEmpty(extent)) {
            // console.log('extent is empty');
            return;
        }
        if (this.#map) {
            const coordinates = this.#getPolygonByBbox(extent);
            this.#feature.setGeometry(new Polygon(coordinates));
            this.#map.getView().fit(extent, {
                padding: [50, 50, 50, 50]
            });
        }
    }

    #createDom(root: HTMLElement){
        this.#olmapDom = document.createElement('div');
        root.appendChild(this.#olmapDom);
        this.#olmapDom.style.cssText = `
            position: absolute;
            z-index: 999;
            bottom: 10px;
            right: 30px;
            height: 160px;
            width: 300px;
            border-radius: 8px;
            padding: 5px;
            border: 2px solid rgba(255, 255, 255, 0.637);
        `
    }

    /**
     * @description: 创建ol地图
     * @param {HTMLElement} mapContainer
     * @return {*}
     */
    #createOlMap(mapContainer: HTMLElement){
        this.#map = new olMap({
            target: mapContainer,
            layers: [
                new TileLayer({
                    source: new XYZSource({
                        url: 'https://t5.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1814d83db8edd8e5b799a0d2128a9685'
                    })
                }),
                new TileLayer({
                    source: new XYZSource({
                        url: 'https://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
                    })
                }),
                new VectorLayer({
                    source: new VectorSource({ features: [ this.#feature ] }),
                    style: new Style({
                        stroke: new Stroke({
                            color: 'red',
                            width: 1
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 0, 0, 0.2)'
                        })
                    })
                })
            ],
            view: new View({
                center: [108.41, 34],
                zoom: 4,
                projection: 'EPSG:4326'
            }),
            controls: defaults({zoom: false})
        });
    }

    #getPolygonByBbox(bbox: number[]) {
        return [
            [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[1]],
                [bbox[2], bbox[3]],
                [bbox[0], bbox[3]],
                [bbox[0], bbox[1]]
            ]
        ];
    }

    #activate() {
        (this.#viewer.container as HTMLElement).onmouseenter = (e: any) => {
            this.#activateContainer = 'viewer';
        };
        this.#map!.getViewport().onmouseenter = (e: any) => {
            this.#activateContainer = 'ol';
        };
    }

}