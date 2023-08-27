<template>
    <CommPanel title="特效点" class="point-panel-box">
        <div class="point-panel">
            <div class="btn-group">
                <CommButton @click="show(point1)">闪烁点</CommButton>
                <CommButton @click="show(point2)">浮动点</CommButton>
                <CommButton @click="show(point3)">水球点</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="hidden" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import flickerPoint from "@/secdev/specialEffectPlot/effectPoint/flickerPoint";
import floatPoint from "@/secdev/specialEffectPlot/effectPoint/floatPoint";
import waterPoloPoint from "@/secdev/specialEffectPlot/domPoint/waterPoloPoint";

let point1: flickerPoint;
let point2: floatPoint;
let point3: waterPoloPoint;

const hidden = () => {
    point1.setVisible(false);
    point2.setVisible(false);
    point3.setVisible(false);
};

const show = (point: flickerPoint | floatPoint | waterPoloPoint) => {
    point.setVisible(true);
};

onMounted(() => {
    point1 = new flickerPoint(
        viewer,
        {
            lon: 108.42583733304246,
            lat: 30.723483346052956,
        }
    );
    point1.setVisible(false);
    point1.init();

    point2 = new floatPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.722983346052956,
        }
    );
    point2.setVisible(false);
    point2.init();

    point3 = new waterPoloPoint(
        viewer,
        {
            lon: 108.42533733304246,
            lat: 30.723483346052956,
        },
        0.52
    );
    point3.setVisible(false);
    point3.init();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(108.42533733304246, 30.722423346052956, 100),
        orientation: new Cesium.HeadingPitchRoll(0.031160188800898325, -0.3508726423584738, 0.00009781616702753126)
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
