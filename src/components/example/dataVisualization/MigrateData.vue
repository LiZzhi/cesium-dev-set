<template>
    <CommPanel title="迁徙图" class="mapv-panel-box">
        <div class="mapv-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import migrateData from "@/secdev/dataVisualization/mapvVisualization/migrateData";

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
    const data = migrateData();
    data.forEach(v => {
        layers.push(new MapVLayer(viewer, ...v));
    })
});
</script>

<style lang="scss" scoped>
@import "./assets/style/MapvDataVisual.scss";
</style>
