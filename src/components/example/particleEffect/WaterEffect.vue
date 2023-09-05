<template>
    <CommPanel title="水体特效" class="water-panel-box">
        <div class="water-panel">
            <div class="btn-group">
                <CommButton @click="">显示</CommButton>
                <CommButton @click="" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as turf from "@turf/turf";
import waterEffect from "@/secdev/particleEffect/water/waterEffect";

const json = require("./assets/json/湖.json");

onMounted(() => {
    const coords = processCoordinates(json);
    const bbox = turf.bbox(turf.polygon(json.features[0].geometry.coordinates[0]));
    const water = waterEffect(new Cesium.PolygonHierarchy(coords));
    viewer.scene.primitives.add(water.primitive);
    // @ts-ignore
    window.w = water;
    viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(...bbox),
    });
});

const processCoordinates = (json: any)=>{
    const coords: number[] = json.features[0].geometry.coordinates.flat(3)
    return Cesium.Cartesian3.fromDegreesArray(coords)
}
</script>

<style lang="scss" scoped>
@import "./assets/style/WaterEffect.scss";
</style>
