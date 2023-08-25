<template>
    <CommPanel title="聚合标绘" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="pointCluster.setVisible(true)">显示</CommButton>
            <CommButton @click="pointCluster.setVisible(false)" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { Cartographic } from "cesium";
import { onMounted } from "vue";
import primitiveCluster from "@/secdev/specialEffectPlot/effectPoint/primitiveCluster";

let pointCluster: primitiveCluster;
const json = require("./assets/json/points.json");
const points:Cartographic[] = [];
json.features.forEach((v:any) =>{
    // @ts-ignore
    points.push(Cesium.Cartographic.fromDegrees(...v.geometry.coordinates))
})

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    pointCluster = new primitiveCluster(viewer, points);
    pointCluster.start();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(107.42533733304246, 27.722983346052956, 1000000),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss"
</style>
