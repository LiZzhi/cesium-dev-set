<template>
    <CommPanel
        title="淹没分析"
        class="inundation-panel-box"
    >
        <div class="inundation-panel">
            <div class="input-group">
                <span class="height-label">淹没水位：</span>
                <CommInput
                    v-model="height"
                    :number="true"
                ></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="drawRegion" class="btn">淹没区域</CommButton>
                <CommButton @click="clear" class="btn" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import inundationAnalysis from "@/secdev/spatialAnalysis/inundationAnalysis";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let inundation: inundationAnalysis;
let draw: drawShape;
let height = ref(100);
onMounted(() => {
    viewer.scene.globe.depthTestAgainstTerrain = true;
    inundation = new inundationAnalysis(viewer);
    draw = new drawShape(viewer);
});

const drawRegion = ()=>{
    draw.drawPolygon((positions)=>{
        inundation.init(positions, height.value).then(()=>{
            inundation.add();
        })
    })
}

const clear = ()=>{
    inundation.remove();
}
</script>

<style lang="scss" scoped>
@import "./assets/style/InundationAnalysis.scss";
</style>
