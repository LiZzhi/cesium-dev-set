<template>
    <CommPanel title="动态文本点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import dynamicLabelPoint from "@/secdev/specialEffectPlot/domPoint/dynamicLabelPoint";

let point: dynamicLabelPoint;

const show = () => {
    point.setVisible(true);
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            108.42533733304246,
            30.722983346052956,
            1000000
        ),
    });
}

const hidden = () => {
    point.setVisible(false);
}

onMounted(() => {
    point = new dynamicLabelPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        },
        "动态文本点"
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
