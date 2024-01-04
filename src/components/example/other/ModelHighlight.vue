<template>
    <CommPanel title="区域模型高亮" class="model-panel-box">
        <div class="model-panel">
            <CommButton @click="e.show = true">显示</CommButton>
            <CommButton @click="e.show = false" contentClass="clear"
                >隐藏</CommButton
            >
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import circle from "./assets/json/newYorkCircle.json";
import cartographicTool from "@/secdev/utils/cartographicTool";

let cs = cartographicTool.toCartesian3S(circle.geometry.coordinates[0]);
let e = new Cesium.Entity({
    polyline: {
        positions: cs,
        width: 5,
        material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW,
        }),
        clampToGround: true,
    },
    polygon: {
        hierarchy: new Cesium.PolygonHierarchy(cs),
        material: Cesium.Color.RED.withAlpha(0.6),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
});
onMounted(() => {
    viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: Cesium.IonResource.fromAssetId(75343),
        })
    );
    viewer.entities.add(e);
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(1332761, -4662399, 4137888), //纽约的地理坐标
        orientation: new Cesium.HeadingPitchRoll(0.6, -0.66),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/VectorWhiteModel.scss";
</style>
