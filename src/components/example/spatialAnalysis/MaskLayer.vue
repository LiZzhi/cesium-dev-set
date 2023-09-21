<template>
    <CommPanel title="遮罩图层" class="mask-panel-box">
        <div class="mask-panel">
            <CommButton @click="">开启</CommButton>
            <CommButton @click="" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cartesian3, Entity } from "cesium";
import maskLayer from "@/secdev/spatialAnalysis/maskLayer";
import json from "./assets/json/QingDao.json";

const boundary1 = [
    Cesium.Cartesian3.fromDegrees(0, 89.9),
    Cesium.Cartesian3.fromDegrees(180, 89.9),
    Cesium.Cartesian3.fromDegrees(180, -89.9),
    Cesium.Cartesian3.fromDegrees(0, -89.9),
]

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
    mask.init(innerHierarchy);
});

// const show = (s: boolean)=>{
//     e1.show = s;
//     e2.show = s;
// }
</script>

<style lang="scss" scoped>
@import "./assets/style/LayerSplit.scss";
</style>
