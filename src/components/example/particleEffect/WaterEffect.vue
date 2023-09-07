<template>
    <CommPanel title="水体特效" class="scene-panel-box">
        <div class="scene-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as turf from "@turf/turf";
import { GroundPrimitive } from "cesium";
import waterEffect from "@/secdev/particleEffect/water/waterEffect";

const json = require("./assets/json/湖.json");
let water: GroundPrimitive

onMounted(() => {
    const coords = processCoordinates(json);
    const bbox = turf.bbox(turf.polygon(json.features[0].geometry.coordinates[0]));
    const waterObj = waterEffect(new Cesium.PolygonHierarchy(coords));
    water = viewer.scene.primitives.add(waterObj.primitive);
    viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(...bbox),
    });
});

const setVisible = (visible: boolean) => {
    water.show = visible;
}

const processCoordinates = (json: any)=>{
    const coords: number[] = json.features[0].geometry.coordinates.flat(3)
    return Cesium.Cartesian3.fromDegreesArray(coords)
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
