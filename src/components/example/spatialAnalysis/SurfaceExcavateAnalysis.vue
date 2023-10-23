<template>
    <CommPanel
        title="地形开挖"
        class="excavate-panel-box"
    >
        <div class="excavate-panel">
            <div class="input-group">
                <span class="depth-label">开挖高度：</span>
                <CommInput
                    v-model="depth"
                    :number="true"
                ></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="drawRegion" class="btn">开挖</CommButton>
                <CommButton @click="clear" class="btn" contentClass="clear">清空</CommButton>
            </div>
            <div class="surface-group" v-if="volume">
                <div class="surface-text">方量：{{volume.toFixed(3)}}m²</div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import surfaceExcavateAnalysis from "@/secdev/spatialAnalysis/surfaceExcavateAnalysis";
import surfaceExcavate from "@/secdev/spatialAnalysis/surfaceExcavate";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let excavate: surfaceExcavateAnalysis;
let draw: drawShape;
let surface: surfaceExcavate|undefined;
let depth = ref(2000);
let volume = ref(0);
onMounted(() => {
    // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.globe.depthTestAgainstTerrain = true;
    excavate = new surfaceExcavateAnalysis(viewer);
    draw = new drawShape(viewer);
});

const drawRegion = ()=>{
    draw.drawPolygon(async (positions)=>{
        clear();
        surface = await excavate.create(positions, {
            depth: depth.value,
            clampToGround: true
        });

        // 计算方量
        let v= surface.computeCutVolume();
        volume.value = v;
    })
}

const clear = ()=>{
    surface && excavate.remove(surface);
    surface = undefined;
    volume.value = 0;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SurfaceExcavate.scss";
</style>
