<template>
    <CommPanel title="竖立文本点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import erectLabelPoint from "@/secdev/specialEffectPlot/domPoint/erectLabelPoint";

let point: erectLabelPoint;

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
    point = new erectLabelPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        },
        "竖立文本点"
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
