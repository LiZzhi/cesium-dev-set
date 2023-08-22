import { Cartesian3, Ellipsoid } from "cesium";

/**
 * @description: 判断在地球的正面还是反面
 * @param {Cartesian3} position 点位
 * @param {Cartesian3} cameraPosition 相机位置
 * @param {Ellipsoid} ellipsoid (可选)椭球,默认为wgs84
 * @return {boolean}
 */
export default function isVisible(
    position: Cartesian3,
    cameraPosition: Cartesian3,
    ellipsoid: Ellipsoid = Cesium.Ellipsoid.WGS84
): boolean {
    // @ts-ignore
    let cameraOccluder = new Cesium.EllipsoidalOccluder(
        ellipsoid,
        cameraPosition
    );
    let viewerVisible = cameraOccluder.isPointVisible(position);
    return viewerVisible;
}
