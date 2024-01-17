<template>
    <CommPanel title="地形夸张" class="terrain-panel-box">
        <div class="terrain-panel">
            <div class="terrain-slider">
                <span class="slider-label">夸张程度：</span>
                <CommSlider v-model="exaggeration" :min="0.0" :max="10.0" :step="0.1"></CommSlider>
            </div>
            <div class="btn-group">
                <CommButton @click="reset" class="comm-btn">复原</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const exaggeration = ref(1.0);   //调节夸张程度
watch(exaggeration, (v)=>{
    // @ts-ignore
    viewer.scene.globe.terrainExaggeration = v;
})

const reset = () => {
    exaggeration.value = 1.0;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/TerrainExaggeration.scss";
</style>
