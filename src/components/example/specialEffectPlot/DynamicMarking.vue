<template>
    <CommPanel title="动态标记" class="sector-panel-box">
        <div class="sector-panel">
            <div class="btn-group">
                <CommButton @click="drawCircle">绘制</CommButton>
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import createDynamicMarking from "@/secdev/specialEffectPlot/polygon/createDynamicMarking";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    draw.drawCircle((p, d) => {
        let { dynamicMark } = createDynamicMarking(viewer, p[0], d);
        collection.add(dynamicMark);
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/SectorScan.scss";
</style>
