<template>
    <CommPanel title="热点面板点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import hotSpotBoardPoint from "@/secdev/specialEffectPlot/domPoint/hotSpotBoardPoint";

let point: hotSpotBoardPoint;

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
    const dom = document.createElement("div");
    dom.innerHTML = "测试div";
    point = new hotSpotBoardPoint(
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

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
