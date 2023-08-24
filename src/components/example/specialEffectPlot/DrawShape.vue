<template>
    <div id="cesium-container"></div>
    <CommPanel
        title="矢量标绘"
        class="draw-panel-box"
    >
        <div class="draw-panel">
            <div class="btn-group">
                <CommButton @click="draw.drawPoint()">画点</CommButton>
                <CommButton @click="draw.drawPloyline()">画线</CommButton>
                <CommButton @click="draw.drawPloygon()">画面</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="draw.drawCircle()">画圆</CommButton>
                <CommButton @click="draw.drawRectangle()">画矩形</CommButton>
                <CommButton @click="draw.revoke()" class="revoke">撤销</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="draw.removeAll()" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

onMounted(() => {
    const viewer = initViewer("cesium-container");

    draw = new drawShape(viewer);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/DrawShape.scss";
</style>
