<template>
    <CommPanel title="影像调色" class="toning-panel-box">
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">透明度：</span>
                <CommSlider v-model="alpha" :min="0.0" :max="1.0" :step="0.1"></CommSlider>
            </div>
        </div>
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">亮度：</span>
                <CommSlider v-model="brightness" :min="0.0" :max="1.0" :step="0.1"></CommSlider>
            </div>
        </div>
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">对比度：</span>
                <CommSlider v-model="contrast" :min="0.0" :max="1.0" :step="0.1"></CommSlider>
            </div>
        </div>
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">饱和度：</span>
                <CommSlider v-model="saturation" :min="0.0" :max="1.0" :step="0.1"></CommSlider>
            </div>
        </div>
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">伽马值：</span>
                <CommSlider v-model="gamma" :min="0.0" :max="10.0" :step="0.1"></CommSlider>
            </div>
        </div>
        <div class="toning-panel">
            <div class="toning-slider">
                <span class="slider-label">色调：</span>
                <CommSlider v-model="hue" :min="0.0" :max="255.0" :step="1.0"></CommSlider>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ImageryLayer } from "cesium";

let layer: ImageryLayer;
const alpha = ref(1.0);
const brightness = ref(1.0);
const contrast = ref(1.0);
const saturation = ref(1.0);
const gamma = ref(1.0);
const hue = ref(0.0);

watch(alpha, (v) => {
    layer.alpha = v;
})
watch(brightness, (v) => {
    layer.brightness = v;
})
watch(contrast, (v) => {
    layer.contrast = v;
})
watch(saturation, (v) => {
    layer.saturation = v;
})
watch(gamma, (v) => {
    layer.gamma = v;
})
watch(hue, (v) => {
    layer.hue = v;
})

onMounted(() => {
    window.globalFunc.setChinaView(viewer);
    layer = viewer.imageryLayers.get(0);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/ImageToning.scss";
</style>
