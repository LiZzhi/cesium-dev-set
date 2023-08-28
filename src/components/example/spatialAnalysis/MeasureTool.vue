<template>
    <CommPanel title="测量工具" class="measure-panel-box">
        <div class="measure-panel">
            <CommButton @click="measure.measureHeight()">高程测量</CommButton>
            <CommButton @click="">高差测量</CommButton>
            <CommButton @click="">距离测量</CommButton>
            <CommButton @click="">周长测量</CommButton>
            <CommButton @click="">面积测量</CommButton>
            <CommButton @click="">角度测量</CommButton>
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

<style lang="scss" scoped></style>
