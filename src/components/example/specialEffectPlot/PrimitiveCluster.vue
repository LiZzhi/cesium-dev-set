<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { Cartographic } from "cesium";
import { onMounted } from "vue";
import primitiveCluster from "@/secdev/specialEffectPlot/effectPoint/primitiveCluster";

const json = require("./assets/json/points.json");
const points:Cartographic[] = [];
json.features.forEach((v:any) =>{
    // @ts-ignore
    points.push(Cesium.Cartographic.fromDegrees(...v.geometry.coordinates))
})

onMounted(() => {
    const viewer = initViewer("cesium-container");
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    const p = new primitiveCluster(viewer, points);
    p.start();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(107.42533733304246, 27.722983346052956, 1000000),
    });
});
</script>

<style lang="scss" scoped></style>
