<template>
    <CommPanel title="边界图" class="boundary-panel-box">
        <div class="boundary-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import strongBoundaryData from "@/secdev/dataVisualization/mapvVisualization/strongBoundaryData";
import cesiumMapLayer from "@/secdev/dataVisualization/lib/mapv/MapVLayer.js";

const layers:any[] = [];

const show = () => {
    layers.forEach(v=>{
        v.show();
    })
}

const hidden = () => {
    layers.forEach(v=>{
        v.hide();
    })
}
onMounted(() => {
    const data = strongBoundaryData();
    data.forEach(v => {
        layers.push(new cesiumMapLayer(viewer, ...v));
    })
});
</script>

<style lang="scss" scoped>
@import "./assets/style/StrongBoundaryData.scss";
</style>
