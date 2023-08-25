<template>
    <CommPanel title="水球点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import waterPoloPoint from "@/secdev/specialEffectPlot/domPoint/waterPoloPoint";

let point: waterPoloPoint;

const show = () => {
    point.setVisible(true);
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722983346052956, 1000000),
    });
}

const hidden = () => {
    point.setVisible(false);
}

onMounted(() => {
    point = new waterPoloPoint(
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

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss"
</style>
