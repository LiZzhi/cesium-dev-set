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
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import surfaceExcavate from "@/secdev/spatialAnalysis/surfaceExcavate";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import { Entity } from "cesium";

let excavate: surfaceExcavate;
let draw: drawShape;
let entity: Entity|undefined;
let depth = ref(2000);
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.globe.depthTestAgainstTerrain = true;
    excavate = new surfaceExcavate(viewer);
    draw = new drawShape(viewer);
});

const drawRegion = ()=>{
    draw.drawPolygon((positions)=>{
        clear();
        entity = excavate.create(positions, {
            depth: depth.value,
        });
    })
}

const clear = ()=>{
    entity && excavate.remove(entity);
    entity = undefined;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SurfaceExcavate.scss";
</style>
