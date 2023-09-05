<template>
    <CommPanel title="区域标注" class="area-panel-box">
        <div class="area-panel">
            <div class="btn-group">
                <CommButton @click="">测试</CommButton>
            </div>
            <div class="btn-group2">
                <CommButton @click="" class="show">全部显示</CommButton>
                <CommButton @click="" class="clear">全部隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as turf from "@turf/turf";
import waterEffect from "@/secdev/particleEffect/water/waterEffect";

const json = require("./assets/json/water.json");

onMounted(() => {
    const coords = processCoordinates(json);
    const bbox = turf.bbox(turf.polygon(json.features[0].geometry.coordinates));
    const water = waterEffect(new Cesium.PolygonHierarchy(coords));
    viewer.scene.primitives.add(water.primitive)

    viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(...bbox)
    });
});

const processCoordinates = (json: any)=>{
    const coords: number[] = json.features[0].geometry.coordinates.flat(2)
    return Cesium.Cartesian3.fromDegreesArray(coords)
}
</script>

<style lang="scss" scoped>
// @import "./assets/style/AreaLabel.scss";
</style>
