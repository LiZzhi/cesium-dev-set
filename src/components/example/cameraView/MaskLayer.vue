<template>
    <CommPanel title="遮罩图层" class="mask-panel-box">
        <div class="mask-panel">
            <CommButton @click="show(true)">开启</CommButton>
            <CommButton @click="show(false)" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cartesian3 } from "cesium";
import maskLayer from "@/secdev/cameraView/maskLayer";
import json from "./assets/json/QingDao.json";

let coords = json.features[0].geometry.coordinates;
const inner: Cartesian3[][] = [];
coords.forEach(coord=>{
    let c3s: Cartesian3[] = [];
    coord[0].forEach(v=>{
        c3s.push(Cesium.Cartesian3.fromDegrees(v[0], v[1]));
    })
    inner.push(c3s);
})
let innerHierarchy = inner.map(v => new Cesium.PolygonHierarchy(v));

let mask: maskLayer;
onMounted(() => {
    mask = new maskLayer(viewer);
    mask.create(innerHierarchy);

    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(-2739901.680409191, 4705954.197375935, 3727704.3452687482),
        orientation: new Cesium.HeadingPitchRoll(6.249615322291631, -0.9035881731401787, 0.0000026632450982333467)
    })
});

const show = (s: boolean)=>{
    if(s){
        mask.create(innerHierarchy);
    } else {
        mask.remove();
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/MaskLayer.scss";
</style>
