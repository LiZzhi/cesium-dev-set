<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import divPoint from "@/secdev/specialEffectPlot/domPoint/divPoint";

onMounted(() => {
    const viewer = initViewer("cesium-container");
    const dom = document.createElement("div");
    dom.innerHTML = "测试div";
    const point = new divPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        },
        dom
    );

    point.init();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722983346052956, 1000000),
    });
});
</script>

<style lang="scss" scoped></style>
