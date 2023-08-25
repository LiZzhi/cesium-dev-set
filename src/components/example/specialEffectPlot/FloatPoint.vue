<template>
    <CommPanel title="浮动点" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import floatPoint from "@/secdev/specialEffectPlot/effectPoint/floatPoint";

let point: floatPoint;

const show = () => {
    point.setVisible(true);
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722423346052956, 100),
        orientation: new Cesium.HeadingPitchRoll(0.031160188800898325, -0.3508726423584738, 0.00009781616702753126)
    });
}

const hidden = () => {
    point.setVisible(false);
}

onMounted(() => {
    point = new floatPoint(
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

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
