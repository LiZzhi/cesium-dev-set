<template>
    <CommPanel title="白模贴窗" class="clip-panel-box">
        <div class="clip-panel">
            <CommButton @click="">显示</CommButton>
            <CommButton @click="" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cesium3DTileset, Color } from "cesium";
import lightShadowModel from "@/secdev/other/lightShadowModel"

let model: Cesium3DTileset;

onMounted(() => {
    Cesium.ExperimentalFeatures.enableModelExperimental = true;
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    let m = new lightShadowModel(
        viewer,
        "http://192.168.131.18:8310/tiltphoto/api/v1/layers/dataset/ChengYangH23Dtiles-B3DM/tileset.json",
        {
            offsetHeight: -40,
            location: true,
        }
    )
});
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
