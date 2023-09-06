<template>
    <CommPanel title="行政区标注" class="region-panel-box">
        <div class="region-panel">
            <div class="btn-group">
                <CommButton @click="insideVisible" class="region-btn">内部行政区</CommButton>
                <CommButton @click="outsideVisible" class="region-btn">外部行政区</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="setAllVisible(true)" class="region-btn" contentClass="show">全部显示</CommButton>
                <CommButton @click="setAllVisible(false)" class="region-btn" contentClass="clear">全部隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { insideRegionEntities, insidePolylineEntities, outsideRegionEntities } from "@/secdev/specialEffectPlot/polygon/regionLabel";
import { Entity } from "cesium";

const regionJson = require("./assets/json/region.json");
const centerJson = require("./assets/json/CHN_adm2.json");
let inside: Entity[] = [];
let polyline: Entity[] = [];
let outside: Entity[] = [];

onMounted(() => {
    inside = insideRegionEntities(centerJson.features);
    for (let i = 0; i < inside.length; i++) {
        const e = inside[i];
        viewer.entities.add(e);
    }
    polyline = insidePolylineEntities(centerJson.features);
    for (let i = 0; i < polyline.length; i++) {
        const e = polyline[i];
        viewer.entities.add(e);
    }
    outside = outsideRegionEntities(regionJson.features);
    for (let i = 0; i < outside.length; i++) {
        const e = outside[i];
        viewer.entities.add(e);
    }

    viewer.scene.camera.flyTo({
        destination: new Cesium.Cartesian3(-2683042.711923044, 8521420.033551317, 3226783.1276060008),
        orientation: new Cesium.HeadingPitchRoll(0.2339898825618132, -1.2046188792096295, 6.282780487348539),
        duration: 1,
    });
});

const insideVisible = ()=>{
    inside.forEach(v=>{
        v.show = !v.show
    })
    polyline.forEach(v=>{
        v.show = !v.show
    })
}

const outsideVisible = ()=>{
    outside.forEach(v=>{
        v.show = !v.show
    })
}

const setAllVisible = (visible: boolean)=>{
    inside.forEach(v=>{
        v.show = visible
    })
    polyline.forEach(v=>{
        v.show = visible
    })
    outside.forEach(v=>{
        v.show = visible
    })
}
</script>

<style lang="scss" scoped>
@import "./assets/style/RegionLabel.scss";
</style>
