<template>
    <CommPanel title="修改模型位置" class="posi-panel-box">
        <div class="posi-panel">
            <div class="btn-group">
                <CommButton @click="nowSelect = '平移'">平移</CommButton>
                <CommButton @click="nowSelect = '旋转'">旋转</CommButton>
                <CommButton @click="nowSelect = '缩放'">缩放</CommButton>
            </div>
            <div class="status-panel">
                <div v-if="nowSelect === '平移'">
                    <div>当前操作：平移</div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('X轴', 1.0)"
                            >X加1</CommButton
                        >
                        <CommButton @click="changePosition('X轴', -1.0)"
                            >X减1</CommButton
                        >
                    </div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('Y轴', 1.0)"
                            >Y加1</CommButton
                        >
                        <CommButton @click="changePosition('Y轴', -1.0)"
                            >Y减1</CommButton
                        >
                    </div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('Z轴', 1.0)"
                            >Z加1</CommButton
                        >
                        <CommButton @click="changePosition('Z轴', -1.0)"
                            >Z减1</CommButton
                        >
                    </div>
                </div>
                <div v-if="nowSelect === '旋转'">
                    <div>当前操作：旋转</div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('航向', 1.0)"
                            >航向角度加1</CommButton
                        >
                        <CommButton @click="changePosition('航向', -1.0)"
                            >航向角度减1</CommButton
                        >
                    </div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('俯仰', 1.0)"
                            >俯仰角度加1</CommButton
                        >
                        <CommButton @click="changePosition('俯仰', -1.0)"
                            >俯仰角度减1</CommButton
                        >
                    </div>
                    <div class="contorl-box">
                        <CommButton @click="changePosition('横滚', 1.0)"
                            >横滚角度加1</CommButton
                        >
                        <CommButton @click="changePosition('横滚', -1.0)"
                            >横滚角度减1</CommButton
                        >
                    </div>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import {
    Cartesian3,
    Color,
    LabelCollection,
    Matrix4,
    PrimitiveCollection,
    Geometry,
    HeadingPitchRoll,
    Quaternion,
    Matrix3,
} from "cesium";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import edgeStage from "@/secdev/other/edgeStage";
import modelEdit from "@/secdev/other/modelEdit";

let dataSources = new Cesium.CustomDataSource();

let me: modelEdit;
let center = Cesium.Cartesian3.fromDegrees(-73.975964, 40.700657, 1000);

let outlineStage: edgeStage;
let select: any[] = [];

let nowSelect = ref("");
let change = reactive({
    transX: 0,
    transY: 0,
    transZ: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    scaleX: 0,
    scaleY: 0,
    scaleZ: 0,
});

onMounted(() => {
    // 视角
    // viewer.scene.screenSpaceCameraController.enableRotate = false; // 旋转
    // viewer.scene.screenSpaceCameraController.enableTranslate = false; // 移动
    // viewer.scene.screenSpaceCameraController.enableZoom = false; // 缩放
    // 轴及其label集合
    viewer.dataSources.add(dataSources);
    // 创建
    me = new modelEdit(viewer, center);
    // 选中
    outlineStage = new edgeStage(viewer, "outlineEffect", {
        visibleEdgeColor: Cesium.Color.fromCssColorString("#a8a8e0"),
        hiddenEdgeColor: Cesium.Color.fromCssColorString("#4d4d4d"),
        outlineWidth: 1,
    });
    outlineStage.init();
    // 设置视角
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            1337953.1073636678,
            -4654073.872827012,
            4140358.1856669122
        ),
        orientation: new Cesium.HeadingPitchRoll(
            3.6828783162310987,
            -0.45054582160374057,
            0.00005298810771936502
        ),
    });
});

watch(nowSelect, (v) => {
    outlineStage.clearSelect();
    if (v === "平移") {
        createTransAxis(me.position, me.model.boundingSphere.radius);
    } else if (v === "旋转") {
        // createRotateAxis(me.position, me.model.boundingSphere.radius);
    }
});

function changePosition(id: string, step: number) {
    outlineStage.clearSelect();
    let pickPosition: Cartesian3;
    switch (id) {
        case "X轴":
            change.transX += step;
            me.transX = change.transX;
            createTransAxis(me.position, me.model.boundingSphere.radius);
            break;
        case "Y轴":
            change.transY += step;
            me.transY = change.transY;
            createTransAxis(me.position, me.model.boundingSphere.radius);
            break;
        case "Z轴":
            change.transZ += step;
            me.transZ = change.transZ;
            createTransAxis(me.position, me.model.boundingSphere.radius);
            break;
        // case "航向":
        //     change.heading += step;
        //     me.heading = change.heading;
        //     createRotateAxis(me.position, me.model.boundingSphere.radius);
        //     break;
        // case "俯仰":
        //     change.pitch += step;
        //     me.pitch = change.pitch;
        //     createRotateAxis(me.position, me.model.boundingSphere.radius);
        //     break;
        // case "横滚":
        //     change.roll += step;
        //     me.roll = change.roll;
        //     createRotateAxis(me.position, me.model.boundingSphere.radius);
        //     break;
        default:
            break;
    }
    highlightAxis(me.position, id);
    outlineStage.changeSelect(select);
}

function createTransAxis(position: Cartesian3, radius: number) {
    dataSources.entities.removeAll();
    // 计算位移矩阵
    let trans = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    // 长度
    let len = radius * 2;
    // 计算坐标轴
    let x = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(len, 0, 0),
        new Cesium.Cartesian3()
    );
    let y = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(0, len, 0),
        new Cesium.Cartesian3()
    );
    let z = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(0, 0, len),
        new Cesium.Cartesian3()
    );
    // X轴
    createSingleAxis([position, x], "X轴", Cesium.Color.RED);
    // Y轴
    createSingleAxis([position, y], "Y轴", Cesium.Color.GREEN);
    // Z轴
    createSingleAxis([position, z], "Z轴", Cesium.Color.BLUE);
}

/**
 * @description: 创建平移轴
 * @param {Cartesian3} positions
 * @param {string} id
 * @param {Color} color
 * @return {*}
 */
function createSingleAxis(positions: Cartesian3[], id: string, color: Color) {
    dataSources.entities.add({
        id: id,
        position: positions[1],
        label: {
            text: id,
            font: "24px Helvetica",
            fillColor: Cesium.Color.WHITE,
            outlineColor: color,
            outlineWidth: 1.0,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1.0,
            style: Cesium.LabelStyle.FILL,
        },
        polyline : {
            positions: positions,
            width: 10.0,
            material: new Cesium.PolylineArrowMaterialProperty(color)
        }
    })
}

// function createRotateAxis(position: Cartesian3, radius: number) {
//     axisCollection.removeAll();
//     axisLabels.removeAll();
//     // 创建局部ENU坐标系（用于获取方向向量）
//     let enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
//     // 直径
//     let diameter = radius * 2;
//     // 获取局部坐标系基向量（单位向量）
//     const enuRotation = new Cesium.Matrix3();
//     Cesium.Matrix4.getRotation(enuMatrix, enuRotation);
//     const east = Cesium.Matrix3.getColumn(
//         enuRotation,
//         0,
//         new Cesium.Cartesian3()
//     ); // 东方向（X轴）
//     const north = Cesium.Matrix3.getColumn(
//         enuRotation,
//         1,
//         new Cesium.Cartesian3()
//     ); // 北方向（Y轴）
//     const up = Cesium.Matrix3.getColumn(
//         enuRotation,
//         2,
//         new Cesium.Cartesian3()
//     ); // 天顶方向（Z轴）

//     // createSingleRotate(
//     //     position,
//     //     diameter,
//     //     Cesium.Cartesian3.subtract(x, position, new Cesium.Cartesian3()),
//     //     "航向",
//     //     Cesium.Color.RED
//     // );
//     createSingleRotate(position, diameter, north, "俯仰", Cesium.Color.GREEN);
//     // createSingleRotate(
//     //     position,
//     //     diameter,
//     //     Cesium.Cartesian3.subtract(z, position, new Cesium.Cartesian3()),
//     //     "横滚",
//     //     Cesium.Color.BLUE
//     // );
// }

// /**
//  * @description: 创建旋转轴
//  * @param {*} position 圆心
//  * @param {*} diameter 直径
//  * @param {*} axis 旋转轴
//  * @param {*} id
//  * @param {*} color
//  * @return {*}
//  */
// function createSingleRotate(
//     position: Cartesian3,
//     diameter: number,
//     axis: Cartesian3,
//     id: string,
//     color: Color
// ) {
//     // 3. 创建旋转矩阵（
//     const rotationMatrix = Cesium.Matrix4.fromRotationTranslation(
//         Cesium.Matrix3.fromQuaternion(
//             Cesium.Quaternion.fromAxisAngle(axis, Cesium.Math.toRadians(90))
//         )
//     );

//     let p = axisCollection.add(
//         new Cesium.Primitive({
//             geometryInstances: new Cesium.GeometryInstance({
//                 id: id,
//                 geometry: Cesium.EllipseOutlineGeometry.createGeometry(
//                     new Cesium.EllipseOutlineGeometry({
//                         center: position,
//                         semiMajorAxis: diameter,
//                         semiMinorAxis: diameter,
//                         height: Cesium.Cartographic.fromCartesian(position)
//                             .height,
//                     })
//                 ) as Geometry,
//                 attributes: {
//                     color: Cesium.ColorGeometryInstanceAttribute.fromColor(
//                         color
//                     ),
//                 },
//                 modelMatrix: rotationMatrix,
//             }),
//             asynchronous: false,
//             appearance: new Cesium.PerInstanceColorAppearance({
//                 flat: true,
//                 faceForward: true,
//                 translucent: true,
//                 closed: false,
//             }),
//         })
//     );
//     p.readyPromise.then(() => {
//         // @ts-ignore
//         let x = p._boundingSpheres[0];
//         console.log(x);

//         let e = viewer.entities.add({
//             position: x.center,
//             ellipsoid: {
//                 radii: new Cesium.Cartesian3(x.radius, x.radius, x.radius),
//                 material: Cesium.Color.RED.withAlpha(0.5),
//             },
//         });
//         console.log(e);
//         viewer.flyTo(e);
//         // @ts-ignore
//         window.e = e
//     });

//     // @ts-ignore
//     window.p = p;
// }

function highlightAxis(p: Cartesian3, id: string) {
    let pick = viewer.scene.drillPick(viewer.scene.cartesianToCanvasCoordinates(p));
    if (pick?.length) {
        for (let i = 0; i < pick.length; i++) {
            const e = pick[i];
            if (e.id?.id === id) {
                select.length = 0;
                console.log(e.primitive._pickIds);
                select = e.primitive._pickIds;
                break;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ChangeModelPosition.scss";
</style>
