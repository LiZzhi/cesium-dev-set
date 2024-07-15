<template>
    <CommPanel title="穿梭道路" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="primitive.show = true">显示</CommButton>
            <CommButton @click="primitive.show = false" contentClass="clear"
                >隐藏</CommButton
            >
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cartesian3, GeometryInstance, GroundPolylinePrimitive } from "cesium";
import cartographicTool from "@/secdev/utils/cartographicTool";
import streamLineAppearance from "@/secdev/specialEffectPlot/lineMaterial/streamLineAppearance";
import road from "./assets/json/qingdaoRoad.json";

let primitive: GroundPolylinePrimitive;

function createInstance(ps: Cartesian3[]) {
    let geomInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
            positions: ps,
            width: 1.7,
        }),
    });
    return geomInstance;
}

onMounted(() => {
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
        new Cesium.MapboxStyleImageryProvider({
            styleId: "dark-v11",
            accessToken: window.$config.token.MAPBOX_TOKEN,
        })
    );

    let instances: GeometryInstance[] = [];
    road.features.forEach((f) => {
        let { coordinates } = f.geometry;
        coordinates.forEach((c) => {
            let cs = cartographicTool.toCartesian3S(c);
            let i = createInstance(cs);
            instances.push(i);
        });
    });
    let { material } = streamLineAppearance();
    primitive = new Cesium.GroundPolylinePrimitive({
        geometryInstances: instances,
        appearance: material,
    });
    viewer.scene.primitives.add(primitive);
    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(
            -2822634.9300073525,
            4823976.31096414,
            3739262.3350110534
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.215004476693308,
            -0.9321495455280289,
            0.0000013863075700726313
        ),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
