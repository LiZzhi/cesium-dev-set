<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import bigMigrateData from "@/secdev/dataVisualization/mapvVisualization/bigMigrateData";
import cesiumMapLayer from "@/secdev/dataVisualization/lib/mapv/MapVLayer.js";

onMounted(() => {
    const viewer = initViewer("cesium-container");

    const data = bigMigrateData();
    data.forEach(v => {
        new cesiumMapLayer(viewer, ...v);
    })
});
</script>

<style lang="scss" scoped></style>
