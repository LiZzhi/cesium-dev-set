<template>
    <CommPanel title="修改模型位置" class="posi-panel-box">
        <div class="posi-panel">
            <p>左键点击模型，按提示对模型进行移动。</p>
            <p>右键点击取消模型选中。</p>
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
} from "cesium";
import { onMounted } from "vue";

let center = Cesium.Cartesian3.fromDegrees(-73.975964, 40.700657, 0);
let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
let model = Cesium.Model.fromGltf({
    url: require("./assets/gltf/CesiumMilkTruck.glb"),
    scale: 50,
    modelMatrix: modelMatrix,
});

let axisCollection: PrimitiveCollection;
let axisLabels: LabelCollection;

onMounted(() => {
    // 添加模型
    viewer.scene.primitives.add(model);
    // 添加坐标轴
    axisCollection = viewer.scene.primitives.add(
        new Cesium.PrimitiveCollection()
    );
    model.readyPromise.then(() => {
        axisLabels = viewer.scene.primitives.add(
            new Cesium.LabelCollection({
                scene: viewer.scene,
            })
        );
        createCoordinateAxis(center, model.boundingSphere.radius);
    });
    // 设置视角
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            1337665.7691589727,
            -4653491.511694918,
            4139380.9028961486
        ),
        orientation: new Cesium.HeadingPitchRoll(
            3.6828783162310987,
            -0.45054582160374057,
            0.00005298810771936502
        ),
    });
});

// 创建坐标轴
function createCoordinateAxis(center: Cartesian3, radius: number) {
    axisCollection.removeAll();
    axisLabels.removeAll();
    // 计算位移矩阵
    let trans = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    // 计算坐标轴
    radius = radius * 2;
    let x = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(radius, 0, 0),
        new Cesium.Cartesian3()
    );
    let y = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(0, radius, 0),
        new Cesium.Cartesian3()
    );
    let z = Cesium.Matrix4.multiplyByPoint(
        trans,
        new Cesium.Cartesian3(0, 0, radius),
        new Cesium.Cartesian3()
    );
    // X轴
    const xAxis = createSingleAxis([center, x], "X轴", Cesium.Color.RED);
    const xLabel = createSingleAxisLabel(x, "X轴", Cesium.Color.RED);
    // Y轴
    const yAxis = createSingleAxis([center, y], "Y轴", Cesium.Color.GREEN);
    const yLabel = createSingleAxisLabel(y, "Y轴", Cesium.Color.GREEN);
    // Z轴
    const zAxis = createSingleAxis([center, z], "Z轴", Cesium.Color.BLUE);
    const zLabel = createSingleAxisLabel(z, "Z轴", Cesium.Color.BLUE);
    axisCollection.add(xAxis);
    axisCollection.add(yAxis);
    axisCollection.add(zAxis);
    axisLabels.add(xLabel);
    axisLabels.add(yLabel);
    axisLabels.add(zLabel);
}
// 创建单个坐标轴
function createSingleAxis(positions: Cartesian3[], id: string, color: Color) {
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            id: id,
            geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 10.0,
            }),
        }),
        appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: Cesium.Material.PolylineArrowType,
                    uniforms: {
                        color: color,
                    },
                },
            }),
        }),
    });
}
// 创建坐标轴文本
function createSingleAxisLabel(
    position: Cartesian3,
    text: string,
    color: Color
) {
    return axisLabels.add({
        text: text,
        font: "24px Helvetica",
        position: position,
        fillColor: Cesium.Color.WHITE,
        outlineColor: color,
        outlineWidth: 1.0,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scale: 1.0,
        style: Cesium.LabelStyle.FILL,
    });
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ChangeModelPosition.scss";
</style>
