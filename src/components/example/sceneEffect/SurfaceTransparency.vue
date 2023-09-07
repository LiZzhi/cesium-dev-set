<template>
    <CommPanel title="地表透明" class="translucency-panel-box">
        <div class="translucency-panel">
            <div class="translucency-slider">
                <span class="slider-label">透明度：</span>
                <CommSlider v-model="alpha" :min="0" :max="1" :step="0.1"></CommSlider>
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

const alpha = ref(0.8);
watch(alpha, (v)=>{
    viewer.scene.globe.translucency.frontFaceAlpha = v;
})

onMounted(() => {
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;  // 是否监测地形碰撞
    viewer.scene.globe.translucency.frontFaceAlpha = 0.8;   // 透明度
    viewer.scene.globe.translucency.enabled = true; //可用透明度

});

const setVisible = (visible: boolean) => {
    viewer.scene.globe.translucency.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SurfaceTransparency.scss";
</style>
