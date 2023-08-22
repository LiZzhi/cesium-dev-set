import { Cartesian3, Ellipsoid, } from "cesium";
import getHeading from "./getHeading";
import getPitch from "./getPitch";

/**
 * 绘制矩形，依次输入A,B,C三点
 * 以A为原点，重新建立局部坐标系，计算C在AB法线的投影终点C1和第四点D，构成矩形
 * @param { Cartesian3[] } param0 A,B,C三点
 * @param { Ellipsoid } e {可选}，世界坐标系，默认为WGS_84
 * @returns
 */
export default function calculateRectangle(
    [pointA, pointB, pointC]: Cartesian3[],
    e: Ellipsoid = Ellipsoid.WGS84
): Cartesian3[] {
    // 局部坐标系到世界坐标系的变换矩阵
    // let heading = Math.atan2(pointB.x-pointA.x, pointB.y-pointA.y)
    let heading = getHeading(pointA, pointB);
    let pitch = getPitch(pointA, pointB);

    let hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);
    let localToWorldMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        pointA,
        hpr,
        e
    );

    // 世界坐标系到局部坐标系的变换矩阵
    let worldToLocalMatrix = Cesium.Matrix4.inverse(
        localToWorldMatrix,
        new Cesium.Matrix4()
    );

    // pointB,pointC 转局部坐标
    let localPosB = Cesium.Matrix4.multiplyByPoint(
        worldToLocalMatrix,
        pointB,
        new Cesium.Cartesian3()
    );

    let localPosC = Cesium.Matrix4.multiplyByPoint(
        worldToLocalMatrix,
        pointC,
        new Cesium.Cartesian3()
    );
    let localPosC1 = new Cesium.Cartesian3(localPosC.x, localPosB.y);
    let localPosD = new Cesium.Cartesian3(localPosC.x, 0);

    // C1,D 世界坐标
    let worldPointC1 = Cesium.Matrix4.multiplyByPoint(
        localToWorldMatrix,
        localPosC1,
        new Cesium.Cartesian3()
    );
    let worldPointD = Cesium.Matrix4.multiplyByPoint(
        localToWorldMatrix,
        localPosD,
        new Cesium.Cartesian3()
    );
    return [pointA, pointB, worldPointC1, worldPointD];
}