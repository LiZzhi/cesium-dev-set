<template>
    <CommPanel title="亮度" class="sceneslider-panel-box">
        <div class="sceneslider-panel">
            <div class="sceneslider-slider">
                <span class="slider-label">亮度：</span>
                <CommSlider v-model="light" :min="0.0" :max="5.0" :step="1.0"></CommSlider>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const brightness = Cesium.PostProcessStageLibrary.createBrightnessStage();
const light = ref(2.0);   //调节亮度
watch(light, (v)=>{
    brightness.uniforms.brightness = v;
})

onMounted(() => {
    viewer.scene.postProcessStages.add(brightness);
    brightness.enabled = true;
    brightness.uniforms.brightness = light.value;
});

const setVisible = (visible: boolean) => {
    brightness.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SceneSliderEffect.scss";
</style>
