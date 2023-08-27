<template>
    <CommPanel title="面板点" class="point-panel-box">
        <div class="point-panel">
            <div class="btn-group">
                <CommButton @click="show(point1)">普通面板点</CommButton>
                <CommButton @click="show(point2)">样本面板点</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="show(point3)">渐变面板点</CommButton>
                <CommButton @click="show(point4)">热点面板点</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="hidden" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import divPoint from "@/secdev/specialEffectPlot/domPoint/divPoint";
import sampleBoardPoint from "@/secdev/specialEffectPlot/domPoint/sampleBoardPoint";
import gradientBoardPoint from "@/secdev/specialEffectPlot/domPoint/gradientBoardPoint";
import hotSpotBoardPoint from "@/secdev/specialEffectPlot/domPoint/hotSpotBoardPoint";

let point1: divPoint;
let point2: sampleBoardPoint;
let point3: gradientBoardPoint;
let point4: hotSpotBoardPoint;

const hidden = () => {
    point1.setVisible(false);
    point2.setVisible(false);
    point3.setVisible(false);
    point4.setVisible(false);
};

const show = (
    point: divPoint | sampleBoardPoint | gradientBoardPoint | hotSpotBoardPoint
) => {
    point.setVisible(true);
};

onMounted(() => {
    const dom1 = document.createElement("div");
    dom1.innerHTML = "测试div";
    point1 = new divPoint(
        viewer,
        {
            lon: 108.5,
            lat: 30.7,
        },
        dom1
    );
    point1.setVisible(false);
    point1.init();

    const dom2 = document.createElement("div");
    dom2.innerHTML = "测试div";
    point2 = new sampleBoardPoint(
        viewer,
        {
            lon: 108,
            lat: 30,
        },
        dom2
    );
    point2.setVisible(false);
    point2.init();

    const dom3 = document.createElement("div");
    dom3.innerHTML = "测试div";
    point3 = new gradientBoardPoint(
        viewer,
        {
            lon: 107.5,
            lat: 29.5,
        },
        dom3
    );
    point3.setVisible(false);
    point3.init();

    const dom4 = document.createElement("div");
    dom4.innerHTML = "测试div";
    point4 = new hotSpotBoardPoint(
        viewer,
        {
            lon: 107,
            lat: 29,
        },
        dom4
    );
    point4.setVisible(false);
    point4.init();

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108, 30, 1000000),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
