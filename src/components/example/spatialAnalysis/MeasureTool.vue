<template>
    <CommPanel title="测量工具" class="measure-panel-box">
        <div class="measure-panel">
            <div class="btn-group">
                <CommButton @click="measure.measureHeight()">高程测量</CommButton>
                <CommButton @click="measure.measureHeightDifference()">高差测量</CommButton>
                <CommButton @click="measure.measureArea()">面积测量</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="measure.measureStraightDistance()" class="half-btn">距离测量(直线)</CommButton>
                <CommButton @click="measure.measureClampDistance()" class="half-btn">距离测量(贴地)</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="measure.revoke()" class="half-btn" contentClass="revoke">撤销</CommButton>
                <CommButton @click="measure.removeAll()" class="half-btn" contentClass="clear">清空</CommButton>
            </div>

        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import measureTool from "@/secdev/spatialAnalysis/measureTool";

let measure:measureTool
onMounted(() => {
    measure = new measureTool(viewer);

    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});
</script>

<style lang="scss" scoped>
@import "./assets/style/MeasureTool.scss"
</style>
