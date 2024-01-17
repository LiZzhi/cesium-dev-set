<template>
    <CommPanel title="卷帘视图" class="split-panel-box">
        <div class="split-panel">
            <CommButton @click="start">开启</CommButton>
            <CommButton @click="destroy" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { SplitDirection, ImageryLayer, Viewer } from "cesium";
import layerSplit from "@/secdev/spatialAnalysis/layerSplit";

let leftSplit: layerSplit;
let rightSplit: layerSplit;
const layer = new Cesium.ImageryLayer(
    new Cesium.ArcGisMapServerImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
    }),
    { show: false }
);

const start = () => {
    const leftLayer = viewer.imageryLayers.get(0);
    const rightLayer = viewer.imageryLayers.get(1);
    rightLayer.show = true;
    leftSplit.create();
    rightSplit.create();
    leftSplit.changeLayer(leftLayer);
    rightSplit.changeLayer(rightLayer);
};

const destroy = () => {
    leftSplit.destory();
    rightSplit.destory();
    const rightLayer = viewer.imageryLayers.get(1);
    rightLayer.show = false;
};

onMounted(() => {
    viewer.imageryLayers.add(layer);
    leftSplit = new layerSplit(viewer, SplitDirection.LEFT);
    rightSplit = new layerSplit(viewer, SplitDirection.RIGHT);
    start();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/LayerSplit.scss";
</style>
