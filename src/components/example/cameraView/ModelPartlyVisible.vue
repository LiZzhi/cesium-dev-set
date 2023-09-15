<template>
    <CommPanel
        title="模型部分可见"
        class="modelpart-panel-box"
    >
        <div class="modelpart-panel">
            <CommButton @click="drawRegion">绘制</CommButton>
            <CommButton @click="partlyVisible.removeAll()" contentClass="clear">清空</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import modelPartlyVisible from "@/secdev/cameraView/modelPartlyVisible";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let partlyVisible: modelPartlyVisible;
let draw: drawShape;

onMounted(() => {
    partlyVisible = new modelPartlyVisible(viewer);
    partlyVisible.activate();
    draw = new drawShape(viewer);

    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});

const drawRegion = ()=>{
    draw.drawPolygon((positions)=>{
        partlyVisible.addRegion(positions);
    })
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelPartlyVisible.scss";
</style>
