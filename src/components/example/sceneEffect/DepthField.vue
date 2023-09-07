<template>
    <CommPanel title="景深" class="sceneslider-panel-box">
        <div class="sceneslider-panel">
            <div class="sceneslider-slider">
                <span class="slider-label">焦距：</span>
                <CommSlider v-model="focalDistance" :min="1.0" :max="1000.0" :step="1.0"></CommSlider>
            </div>
            <div class="sceneslider-slider">
                <span class="slider-label">δ：</span>
                <CommSlider v-model="delta" :min="1.0" :max="5.0" :step="0.1"></CommSlider>
            </div>
            <div class="sceneslider-slider">
                <span class="slider-label">σ：</span>
                <CommSlider v-model="sigma" :min="1.0" :max="5.0" :step="0.1"></CommSlider>
            </div>
            <div class="sceneslider-slider">
                <span class="slider-label">步长：</span>
                <CommSlider v-model="stepSize" :min="1.0" :max="10.0" :step="0.2"></CommSlider>
            </div>
            <div class="btn-group">
                <CommButton @click="setVisible(true)" class="comm-btn">显示</CommButton>
                <CommButton @click="setVisible(false)" class="comm-btn" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";

const depth = Cesium.PostProcessStageLibrary.createDepthOfFieldStage();
const focalDistance = ref(1.0);
const delta = ref(1.0);
const sigma = ref(1.0);
const stepSize = ref(1.0);
watchEffect(()=>{
    depth.uniforms.focalDistance = focalDistance.value;
    depth.uniforms.delta = delta.value;
    depth.uniforms.sigma = sigma.value;
    depth.uniforms.stepSize = stepSize.value;
})

onMounted(() => {
    viewer.scene.postProcessStages.add(depth);
    depth.enabled = true;
    depth.uniforms.focalDistance = 1;
    depth.uniforms.delta = 1;
    depth.uniforms.sigma = 1;
    depth.uniforms.stepSize = 1;
});

const setVisible = (visible: boolean) => {
    depth.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SceneSliderEffect.scss";
</style>
