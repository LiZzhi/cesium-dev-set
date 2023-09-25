<template>
    <CommPanel title="原生热力图" class="heatmap-panel-box">
        <div class="heatmap-panel">
            <div class="btn-group">
                <CommButton @click="flyto" class="fly">飞到模型</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="create">显示</CommButton>
                <CommButton @click="remove" contentClass="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cesium3DTileset } from "cesium";
import heatMap, { pointType } from "@/secdev/dataVisualization/custom/heatMap";
import { CesiumHeatmap } from "@/secdev/dataVisualization/custom/cesiumHeatmap";
import json from "./assets/json/busstop2016.json"

let map: heatMap;
let heatMapObj: CesiumHeatmap|undefined;
let values: pointType[] = [];
let model: Cesium3DTileset;

json.features.forEach(f => {
    values.push({
        x: f.geometry.coordinates[0],
        y: f.geometry.coordinates[1],
        value: 100 * Math.random(),
    })
})

const create = () => {
    remove();
    heatMapObj = map.create(values, 500, 10, {
        zoomToLayer: true
    });
}

const remove = () => {
    heatMapObj && map.remove(heatMapObj);
    heatMapObj = undefined;
}

const flyto = () => {
    viewer.flyTo(model);
}

onMounted(() => {
    // 加载3DTileset
    model = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: "http://resource.dvgis.cn/data/3dtiles/ljz/tileset.json",
        })
    )
    map = new heatMap(viewer);
    create();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/CesiumHeatMap.scss";
</style>
