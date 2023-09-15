/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-15 16:23:41
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-15 17:39:41
 * @FilePath: \cesium-secdev-set\src\secdev\cameraView\modelPartlyVisible.ts
 * @Description: 模型部分可见
 */
import { Color, Viewer, Cartesian3, PolygonGeometry, PrimitiveCollection } from "cesium";

export default class modelPartlyVisible{
    #viewer: Viewer;
    invisibleColor: Color;
    collection: PrimitiveCollection;
    constructor(viewer: Viewer, color: Color=new Cesium.Color(0.25, 0.25, 0.25, 1)){
        this.#viewer = viewer;
        this.invisibleColor = color;
        this.collection = new Cesium.PrimitiveCollection();
        viewer.scene.primitives.add(this.collection);
        this.#viewer.scene.invertClassificationColor = this.invisibleColor;
    }

    activate() {
        this.#viewer.scene.invertClassification = true;
    }

    deactivate() {
        this.#viewer.scene.invertClassification = false;
    }

    addRegion(positions: Cartesian3[]){
        let geometry = this.#createGeometry(positions, 100000);
        let primitive = this.#addPrimitive(geometry);
        this.collection.add(primitive);
    }

    removeAll(){
        this.collection.removeAll();
    }

    #addPrimitive(polygonGeometry: PolygonGeometry) {
        let primitive = new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: polygonGeometry,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.fromRandom({alpha: 0.8})
                    ),
                    show: new Cesium.ShowGeometryInstanceAttribute(false),
                }
            }),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
        return primitive;
    }

    #createGeometry(positions: Cartesian3[], extrudedHeight: number) {
        let polygonGeometry = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
            // perPositionHeight: true, //使用z坐标 否则高度从0开始
            // extrudedHeight: extrudedHeight //拉伸高度
        });
        return polygonGeometry;
    }
}