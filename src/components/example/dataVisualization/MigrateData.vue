<template>
    <CommPanel title="迁徙图" class="migrate-panel-box">
        <div class="migrate-panel">
            <CommButton @click="show">显示</CommButton>
            <CommButton @click="hidden" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import migrateData from "@/secdev/dataVisualization/mapvVisualization/migrateData";
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
    const data = migrateData();
    data.forEach(v => {
        layers.push(new cesiumMapLayer(viewer, ...v));
    })
});
</script>

<style lang="scss" scoped>
@import "./assets/style/MigrateData.scss";
</style>
