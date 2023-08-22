<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import waterPoloPoint from "@/secdev/specialEffectPlot/domPoint/waterPoloPoint";

onMounted(() => {
    const viewer = initViewer("cesium-container");
    const point = new waterPoloPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        },
        0.56
    );

    point.init();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722983346052956, 1000000),
    });
});
</script>

<style lang="scss" scoped></style>
