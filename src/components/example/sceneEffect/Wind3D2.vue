<template>
    <CommPanel title="风场特效2" class="scene-panel-box">
        <div class="scene-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear"
                    >隐藏</CommButton
                >
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import wind3D2 from "@/secdev/sceneEffect/wind/wind3D2";
import data from "./assets/json/wind.json";

let wind: wind3D2;
const windOptions = {
    colorScale: [
        "rgb(36,104, 180)",
        "rgb(60,157, 194)",
        "rgb(128,205,193 )",
        "rgb(151,218,168 )",
        "rgb(198,231,181)",
        "rgb(238,247,217)",
        "rgb(255,238,159)",
        "rgb(252,217,125)",
        "rgb(255,182,100)",
        "rgb(252,150,75)",
        "rgb(250,112,52)",
        "rgb(245,64,32)",
        "rgb(237,45,28)",
        "rgb(220,24,32)",
        "rgb(180,0,35)",
    ],
    frameRate: 16,
    maxAge: 60,
    globalAlpha: 0.9,
    velocityScale: 1 / 30,
    paths: 2000,
};

const setVisible = (visible: boolean) => {
    wind.setVisible(visible);
};

onMounted(() => {
    // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    wind = new wind3D2(viewer, data, windOptions);
    wind.init();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
