<template>
    <CommPanel title="风场特效" class="wind3d-panel-box">
        <div class="wind3d-panel">
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>最大粒子数</span>
                    <span>{{ maxParticles }}</span>
                </div>
                <CommSlider v-model="maxParticles" :min="1.0" :max="65536.0" :step="1.0"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>粒子高度</span>
                    <span>{{ particleHeight }}</span>
                </div>
                <CommSlider v-model="particleHeight" :min="1.0" :max="10000.0" :step="1.0"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>消失不透明度</span>
                    <span>{{ fadeOpacity }}</span>
                </div>
                <CommSlider v-model="fadeOpacity" :min="0.9" :max="0.999" :step="0.001"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>下降率</span>
                    <span>{{ dropRate }}</span>
                </div>
                <CommSlider v-model="dropRate" :min="0.0" :max="0.1" :step="0.0001"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>下降速度</span>
                    <span>{{ dropRateBump }}</span>
                </div>
                <CommSlider v-model="dropRateBump" :min="0.0" :max="0.1" :step="0.001"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>速度系数</span>
                    <span>{{ speedFactor }}</span>
                </div>
                <CommSlider v-model="speedFactor" :min="0.1" :max="8.0" :step="0.1"></CommSlider>
            </div>
            <div class="wind3d-slider">
                <div class="slider-label">
                    <span>线宽</span>
                    <span>{{ lineWidth }}</span>
                </div>
                <CommSlider v-model="lineWidth" :min="0.0" :max="16.0" :step="0.1"></CommSlider>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { PrimitiveCollection } from "cesium";
import wind3D from "@/secdev/sceneEffect/wind/wind3D";

const path = require("./assets/nc/demo.nc");
let wind: wind3D;
let p: PrimitiveCollection;

const maxParticles = ref(4096);
const particleHeight = ref(100);
const fadeOpacity = ref(0.996);
const dropRate = ref(0.003);
const dropRateBump = ref(0.01);
const speedFactor = ref(1.0);
const lineWidth = ref(4.0);

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    wind = new wind3D(viewer);
    create();

    watchEffect(()=>{
        wind.setOption({
            maxParticles: maxParticles.value,
            particleHeight: particleHeight.value,
            fadeOpacity: fadeOpacity.value,
            dropRate: dropRate.value,
            dropRateBump: dropRateBump.value,
            speedFactor: speedFactor.value,
            lineWidth: lineWidth.value,
        });
    })
});

function create() {
    fetch(path)
        .then((res) => res.arrayBuffer())
        .then((res) => {
            let { primitive, removeEvent } = wind.createWind3DPrimitive(res);
            p = viewer.scene.primitives.add(primitive);
        });
}
</script>

<style lang="scss" scoped>
@import "./assets/style/Wind3D.scss";
</style>
