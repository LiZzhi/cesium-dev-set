<template>
    <CommPanel
        title="可视域分析"
        class="eye-panel-box"
    >
        <div class="eye-panel">
            <CommButton @click="setVisualField">开启</CommButton>
            <CommButton @click="" contentClass="clear">撤回</CommButton>
            <CommButton @click="" contentClass="clear">清空</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import visualFieldAnalysis from "@/secdev/spatialAnalysis/visualFieldAnalysis";
import visualField from "@/secdev/spatialAnalysis/visualField";

let analysis: visualFieldAnalysis;
let draw: drawShape;
let visualFields: visualField[] = []
onMounted(() => {
    viewer.scene.globe.depthTestAgainstTerrain = true;
    draw = new drawShape(viewer);
    analysis = new visualFieldAnalysis(viewer);
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});

const setVisualField = () => {
    draw.drawPolyline((position)=>{
        let v = analysis.init(position[0], {
            show: false,
            distance: Cesium.Cartesian3.distance(position[0], position[1])
        })
        visualFields.push(v);
        v.init(viewer);
    }, {
        maxNode: 2,
    })
}
</script>

<style lang="scss" scoped>
@import "./assets/style/EagleEyeView.scss";
</style>
