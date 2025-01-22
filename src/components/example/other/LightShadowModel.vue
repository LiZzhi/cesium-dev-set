<template>
    <CommPanel title="渐变模型" class="clip-panel-box">
        <div class="clip-panel">
            <CommButton @click="changeDiffuseShow(true)">显示</CommButton>
            <CommButton @click="changeDiffuseShow(false)" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import lightShadowModel from "@/secdev/other/lightShadowModel"

let m: lightShadowModel;

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
        new Cesium.ArcGisMapServerImageryProvider({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer"
        })
    )
    m = new lightShadowModel(
        viewer,
        "http://192.168.131.18:8310/tiltphoto/api/v1/layers/dataset/ChengYangH23Dtiles-B3DM/tileset.json",
        {
            maxHeight: 100,
            location: true,
        }
    )
});

function changeDiffuseShow(show: boolean) {
    m.changeDiffuseShow(show);
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
