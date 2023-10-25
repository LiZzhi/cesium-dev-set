import { Cartesian3, Viewer, Entity } from "cesium";
import getMinHeight from "../utils/getMinHeight";

export default class inundationAnalysis{
    #viewer: Viewer;
    #region: Entity;
    #flood: Entity;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
        this.#region = new Cesium.Entity();
        this.#flood = new Cesium.Entity();
    }

    /**
     * @description: 初始化
     * @param {Cartesian3[]} positions 区域
     * @param {number} floodHeight 淹没高度
     * @return {*}
     */
    async init(positions: Cartesian3[], floodHeight: number){
        this.remove();
        positions = Cesium.clone(positions);
        let minHeight = await getMinHeight(this.#viewer.terrainProvider, positions);

        if (!positions[0].equals(positions[positions.length-1])) {
            positions.push(positions[0]);
        }

        let noHeightPositions = positions.map(p => {
            // 洪水实体地面高度改为0
            let c = Cesium.Cartographic.fromCartesian(p);
            return Cesium.Cartesian3.fromRadians(c.longitude, c.latitude);
        })

        // 淹没区域
        this.#region = new Cesium.Entity({
            polyline: {
                positions: positions,
                material: Cesium.Color.fromCssColorString("#FD8045"),
                width: 3,
                clampToGround: true,
                arcType: Cesium.ArcType.RHUMB,
                // material: new Cesium.Color(0.25, 0.62, 0.99),
            },
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: Cesium.Color.fromCssColorString("#FD8045").withAlpha(0.6),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                arcType: Cesium.ArcType.RHUMB,
            }
        });
        // 洪水实体
        this.#flood = new Cesium.Entity({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(noHeightPositions),
                height:0,
                extrudedHeight: minHeight + floodHeight,
                material: new Cesium.Color(0.25, 0.62, 0.99, 0.6),
                arcType: Cesium.ArcType.RHUMB,
            }
        })
    }

    /**
     * @description: 添加
     * @return {*}
     */
    add(){
        this.remove();
        this.#viewer.entities.add(this.#region);
        this.#viewer.entities.add(this.#flood);
    }

    /**
     * @description: 移除
     * @return {*}
     */
    remove(){
        this.#viewer.entities.remove(this.#region);
        this.#viewer.entities.remove(this.#flood);
    }
}