<template>
    <div id="cesium-container"></div>
    <CommPanel
        title="矢量标绘"
        :style="{
            top: '8%',
            left: '2%',
        }"
    >
        <div class="draw-panel">
            <el-button @click="draw.drawPoint()">画点</el-button>
            <el-button @click="draw.drawPloyline()">画线</el-button>
            <el-button @click="draw.drawPloygon()">画面</el-button>
            <el-button @click="draw.drawCircle()">画圆</el-button>
            <el-button @click="draw.drawRectangle()">画矩形</el-button>
            <el-button @click="draw.revoke()">撤销</el-button>
            <el-button @click="draw.removeAll()">清空</el-button>
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
