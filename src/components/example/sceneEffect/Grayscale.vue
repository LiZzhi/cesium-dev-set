<template>
    <CommPanel title="灰度" class="sceneslider-panel-box">
        <div class="sceneslider-panel">
            <div class="sceneslider-slider">
                <span class="slider-label">对比度：</span>
                <CommSlider v-model="gradations" :min="1.0" :max="20.0" :step="1.0"></CommSlider>
            </div>
            <div class="btn-group">
                <CommButton @click="setVisible(true)" class="comm-btn">显示</CommButton>
                <CommButton @click="setVisible(false)" class="comm-btn" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const grayscale = Cesium.PostProcessStageLibrary.createBlackAndWhiteStage();
const gradations = ref(15.0);   //调节对比度
watch(gradations, (v)=>{
    grayscale.uniforms.gradations = v;
})

onMounted(() => {
    viewer.scene.postProcessStages.add(grayscale);
    grayscale.enabled = true;
    grayscale.uniforms.gradations = gradations.value;
});

const setVisible = (visible: boolean) => {
    grayscale.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SceneSliderEffect.scss";
</style>
