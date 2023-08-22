<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import floatPoint from "@/secdev/specialEffectPlot/effectPoint/floatPoint";

onMounted(() => {
    const viewer = initViewer("cesium-container");
    const point = new floatPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        }
    );

    point.init();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722423346052956, 100),
        orientation: new Cesium.HeadingPitchRoll(0.031160188800898325, -0.3508726423584738, 0.00009781616702753126)
    });
});
</script>

<style lang="scss" scoped></style>
