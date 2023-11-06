<template>
    <CommPanel
        title="地理网格"
        class="grid-panel-box"
    >
        <div class="grid-panel">
            <div class="btn-group">
                <CommButton @click="clear" class="clear">清空图形</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="create" class="btn">开启</CommButton>
                <CommButton @click="destroy" class="btn" contentClass="destroy">关闭</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import geoGrid from "@/secdev/spatialAnalysis/geoGrid";
import entityFactory from "@/secdev/utils/entityFactory";
import { Rectangle } from "cesium";

let grid: geoGrid;

onMounted(() => {
    grid = new geoGrid(viewer);
    create();
});

const create = ()=>{
    grid.init((rectangle: Rectangle)=>{
        let e = entityFactory.createRectangle(rectangle);
        viewer.entities.add(e);
        alert(`north: \t${Cesium.Math.toDegrees(rectangle.north).toFixed(5)}°\nsouth: \t${Cesium.Math.toDegrees(rectangle.south).toFixed(5)}°\nwest: \t${Cesium.Math.toDegrees(rectangle.west).toFixed(5)}°\neast: \t${Cesium.Math.toDegrees(rectangle.east).toFixed(5)}°`)
    })
}

const destroy = ()=>{
    grid.remove();
}

const clear = ()=>{
    viewer.entities.removeAll()
}
</script>

<style lang="scss" scoped>
@import "./assets/style/GeoGrid.scss";
</style>
