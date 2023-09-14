/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-09-14 11:18:35
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-09-14 16:28:30
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\heightLimitAnalysis.ts
 * @Description: 限高分析
 */
import { Viewer, PolygonHierarchy, Entity, ClassificationPrimitive } from "cesium";
import entityFactory from "../utils/entityFactory";

export default class heightLimitAnalysis{
    #viewer: Viewer;
    #hierarchy: PolygonHierarchy;
    #height: number;
    #entity: Entity;
    #primitive: ClassificationPrimitive;
    #isStart: boolean;
    constructor(viewer: Viewer, hierarchy: PolygonHierarchy, height: number){
        this.#viewer = viewer;
        this.#hierarchy = hierarchy;
        this.#height = height;
        this.#entity = new Cesium.Entity();
        this.#primitive = new ClassificationPrimitive();
        this.#isStart = false;
    }

    init(){
        if(!this.#isStart){
            this.#viewer.scene.invertClassification = true;
            this.#viewer.scene.invertClassificationColor = new Cesium.Color(1, 1, 1, 1);
            this.#entity = entityFactory.createHeightPloygon(
                this.#hierarchy,
                new Cesium.CallbackProperty(()=>this.#height, false)
            );
            this.#viewer.entities.add(this.#entity);
            this.#primitive = this.#createClassificationPrimitive();
            this.#viewer.scene.primitives.add(this.#primitive);
            this.#isStart = true;
        }
    }

    destroy(){
        if(this.#isStart){
            this.#viewer.scene.primitives.remove(this.#primitive);
            this.#viewer.scene.invertClassification = false;
            this.#viewer.entities.remove(this.#entity);
            this.#entity = new Cesium.Entity();
            this.#primitive = new ClassificationPrimitive();
            this.#isStart = false;
        }
    }

    get height(){
        return this.#height;
    }
    set height(height: number){
        if(this.#isStart){
            this.#height = height;
            this.#viewer.scene.primitives.remove(this.#primitive);
            this.#primitive = this.#createClassificationPrimitive();
            this.#viewer.scene.primitives.add(this.#primitive);
        }
    }

    #createClassificationPrimitive(){
        return new Cesium.ClassificationPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: this.#hierarchy,
                    height: this.#height,
                    extrudedHeight: 200000
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.RED.withAlpha(0.6)
                    ),
                    show: new Cesium.ShowGeometryInstanceAttribute(true)
                },
            })
        })
    }
}