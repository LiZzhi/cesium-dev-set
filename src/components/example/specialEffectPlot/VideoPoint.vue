<template>
    <CommPanel title="视频点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="point.setVisible(true)">显示</CommButton>
            <CommButton @click="point.setVisible(false)" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import sampleBoardPoint from "@/secdev/specialEffectPlot/domPoint/sampleBoardPoint";
import creatVideo from "@/utils/creatVideo";

let point: sampleBoardPoint;

onMounted(() => {
    const video = creatVideo("http://220.161.87.62:8800/hls/0/index.m3u8");
    point = new sampleBoardPoint(viewer, {
        lon: 108.5,
        lat: 30.7,
    }, video.videoBox);
    point.init();
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108.5, 30.7, 1000000),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss"
</style>
