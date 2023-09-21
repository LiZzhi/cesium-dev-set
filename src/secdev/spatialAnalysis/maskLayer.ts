/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-20 17:24:57
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-21 22:35:19
 * @FilePath: \cesium-secdev-set\src\secdev\spatialAnalysis\maskLayer.ts
 * @Description: 反选遮罩
 */
import { Viewer, PolygonHierarchy, GeometryInstance } from "cesium";

export default class {
    #viewer: Viewer;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
    }

    init(center: PolygonHierarchy[], height: number=1000) {
        let [p1, p2] = this.globalMaskPosition;
        let h1 = new Cesium.PolygonHierarchy(p1, center);
        let h2 = new Cesium.PolygonHierarchy(p2);

        this.#viewer.entities.add(this.#createMaskPolygon(h1));
        this.#viewer.entities.add(this.#createMaskPolygon(h2));

        let p = this.#createCenterPolygon(center, height);
        this.#viewer.scene.primitives.add(p);
    }

    #createCenterPolygon(center: PolygonHierarchy[], height: number) {
        let wallInstances: Array<GeometryInstance> = [];
        for (let i = 0; i < center.length; i++) {
            const positions = center[i].positions;
            let wall = new Cesium.GeometryInstance({
                geometry: new Cesium.WallGeometry({
                    positions: positions,
                    maximumHeights: positions.map(() => height),
                }),
            });
            wallInstances.push(wall);
        }
        return new Cesium.Primitive({
            geometryInstances: wallInstances,
            appearance: new Cesium.MaterialAppearance({
                material: Cesium.Material.fromType("Image", {
                    image: require("../assets/img/maskLayer/wall.png"),
                }),
            }),
        });
    }

    #createMaskPolygon(hierarchy: PolygonHierarchy) {
        return new Cesium.Entity({
            polygon: {
                hierarchy: hierarchy,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                material: Cesium.Color.BLACK,
            },
        });
    }

    /**
     * @description: 遮盖范围
     * @return {*}
     */
    get globalMaskPosition() {
        return [
            [
                new Cesium.Cartesian3(
                    3197104.586923899,
                    0.5580000157243585,
                    5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    3197104.586923899,
                    0.5580000157243585,
                    -5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    -3197104.5869239476,
                    3.915323898915733,
                    -5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    -3197104.5869239476,
                    3.915323898915733,
                    5500477.1339386385
                ),
            ],
            [
                new Cesium.Cartesian3(
                    3197104.586923899,
                    -0.5580000157243585,
                    5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    3197104.586923899,
                    -0.5580000157243585,
                    -5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    -3197104.5869239476,
                    -3.915323898915733,
                    -5500477.1339386385
                ),
                new Cesium.Cartesian3(
                    -3197104.5869239476,
                    -3.915323898915733,
                    5500477.1339386385
                ),
            ],
        ];
    }
}
