import { Cartesian3 } from "cesium"

/**
 * 计算两点 Pitch
 * @param { Cartesian3 } pointA
 * @param { Cartesian3 } pointB
 * @returns { number } Pitch,弧度制
 */
export default function getPitch(pointA: Cartesian3, pointB: Cartesian3): number {
    // 建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
    // 向量AB
    const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
    // 因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    // AB为世界坐标中的向量
    // 因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
    // 归一化
    let direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
    return  Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
}