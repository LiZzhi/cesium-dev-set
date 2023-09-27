<template>
    <CommPanel
        title="模型裁剪"
        class="clip-panel-box"
    >
        <div class="clip-panel">
            <CommButton @click="drawRegion">裁剪</CommButton>
            <CommButton @click="clear" contentClass="clear">清空</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import modelClip from "@/secdev/specialEffectPlot/model/modelClip";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import { Cesium3DTileset } from "cesium";

let clip: modelClip;
let draw: drawShape;
let model: Cesium3DTileset;
onMounted(() => {
    clip = new modelClip();
    draw = new drawShape(viewer);
    model = new Cesium.Cesium3DTileset({
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
    })
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(model)
    );
});

const drawRegion = ()=>{
    draw.drawPolygon((positions)=>{
        clip.clip(model, positions);
    })
}

const clear = ()=>{
    clip.remove(model);
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
