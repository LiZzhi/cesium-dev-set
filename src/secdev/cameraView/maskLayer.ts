/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-20 17:24:57
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-08-02 16:15:20
 * @FilePath: \cesium-secdev-set\src\secdev\cameraView\maskLayer.ts
 * @Description: 遮罩图层
 */
import {
    Viewer,
    PolygonHierarchy,
    GeometryInstance,
    CustomDataSource,
    Primitive,
} from "cesium";
import uuid from "@/utils/uuid";

export type maskLayerType = {
    wall: boolean; // 是否启用边界墙
    height: number; // 边界墙高度，默认为1000
    alpha: number; // 遮罩透明度
};

export default class {
    #viewer: Viewer;
    #collection: CustomDataSource;
    #wall: Primitive | undefined;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        this.#collection = new Cesium.CustomDataSource(`mask-${uuid()}`);
        this.#viewer.dataSources.add(this.#collection);
        this.#wall = undefined;
    }

    /**
     * @description: 创建
     * @param {PolygonHierarchy[]} center 可视区域，类型为数组，可传入多个区域
     * @param {maskLayerType} option (可选)，
     * @return {*}
     */
    create(center: PolygonHierarchy[], option: Partial<maskLayerType> = {}) {
        let o = Object.assign(
            {
                wall: true,
                height: 1000,
                alpha: 1.0,
            },
            option
        );

        this.remove();

        let [p1, p2] = this.globalMaskPosition;
        let h1 = new Cesium.PolygonHierarchy(p1, center);
        let h2 = new Cesium.PolygonHierarchy(p2);

        this.#collection.entities.add(this.#createMaskPolygon(h1, o.alpha));
        this.#collection.entities.add(this.#createMaskPolygon(h2, o.alpha));

        if (o.wall) {
            this.#wall = this.#createWallPolygon(center, o.height);
            this.#viewer.scene.primitives.add(this.#wall);
        }
    }

    remove() {
        this.#collection.entities.removeAll();
        this.#viewer.scene.primitives.remove(this.#wall);
        this.#wall = undefined;
    }

    #createWallPolygon(center: PolygonHierarchy[], height: number) {
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

    #createMaskPolygon(hierarchy: PolygonHierarchy, alpha: number) {
        return new Cesium.Entity({
            polygon: {
                hierarchy: hierarchy,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                material: Cesium.Color.BLACK.withAlpha(alpha),
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
