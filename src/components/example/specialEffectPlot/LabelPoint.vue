<template>
    <CommPanel title="文本点" class="point-panel-box">
        <div class="point-panel">
            <div class="btn-group">
                <CommButton @click="show(point1)">竖立文本点</CommButton>
                <CommButton @click="show(point2)">动态文本点</CommButton>
                <CommButton @click="show(point3)">LED文本点</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="hidden" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import dynamicLabelPoint from "@/secdev/specialEffectPlot/domPoint/dynamicLabelPoint";
import erectLabelPoint from "@/secdev/specialEffectPlot/domPoint/erectLabelPoint";
import ledLabelPoint from "@/secdev/specialEffectPlot/domPoint/ledLabelPoint";

let point1: dynamicLabelPoint;
let point2: erectLabelPoint;
let point3: ledLabelPoint;

const hidden = () => {
    point1.setVisible(false);
    point2.setVisible(false);
    point3.setVisible(false);
};

const show = (point: dynamicLabelPoint | erectLabelPoint | ledLabelPoint) => {
    point.setVisible(true);
};

onMounted(() => {
    point1 = new dynamicLabelPoint(
        viewer,
        {
            lon: 108.5,
            lat: 30.7,
        },
        "测试文本"
    );
    point1.setVisible(false);
    point1.init();

    point2 = new erectLabelPoint(
        viewer,
        {
            lon: 108,
            lat: 30,
        },
        "测试文本"
    );
    point2.setVisible(false);
    point2.init();

    point3 = new ledLabelPoint(
        viewer,
        {
            lon: 107.5,
            lat: 29.5,
        },
        "LED"
    );
    point3.setVisible(false);
    point3.init();

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108, 30, 1000000),
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss";
</style>
