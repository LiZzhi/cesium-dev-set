<template>
    <CommPanel title="流出图" class="echarts-panel-box">
        <div class="echarts-panel">
            <CommButton @click="setVisible(true)">显示</CommButton>
            <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import scatterMap from "@/secdev/dataVisualization/echartsVisualization/scatterMap";

let layer: any;

const setVisible = (show: boolean) => {
    layer.setVisible(show);
}

onMounted(() => {
    let options = scatterMap();
    layer = new EchartsLayer(viewer, options);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EchartsMapVisual.scss";
</style>
