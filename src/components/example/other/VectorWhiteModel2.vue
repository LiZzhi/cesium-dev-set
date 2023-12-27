<template>
    <CommPanel
        title="矢量城市白模2"
        class="model-panel-box"
    >
        <div class="model-panel">
            <CommButton @click="collection.show=true">显示</CommButton>
            <CommButton @click="collection.show=false" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang='ts'>
import { onMounted } from "vue";
import { Cartesian3 } from "cesium";
import building from "./assets/json/building_HanJiang.json";

type coordHeightType = {
    coord: Cartesian3[],
    height: number,
}

let collection = new Cesium.CustomDataSource("whiteModel");
let features = building.features;
let c3Arr:coordHeightType[] = [];
features.forEach((f) => {
    let coords = f.geometry.coordinates.flat(2);
    c3Arr.push({coord: Cesium.Cartesian3.fromDegreesArray(coords), height: f.properties.height});
})
c3Arr.forEach((c) => {
    let entity = new Cesium.Entity({
        polygon:{
            hierarchy: new Cesium.PolygonHierarchy(c.coord),
            height: 0,
            extrudedHeight: c.height,
            arcType: Cesium.ArcType.RHUMB,
            material: Cesium.Color.WHITE.withAlpha(0.8),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 0.5,
        }
    });
    collection.entities.add(entity);
})

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.dataSources.add(collection);
    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(-2269792.505899, 5023104.730678, 3226017.575864),
        orientation: new Cesium.HeadingPitchRoll(5.826516, -0.899979, 6.281096),
    })
});
</script>

<style lang='scss' scoped>
@import "./assets/style/VectorWhiteModel.scss";
</style>
