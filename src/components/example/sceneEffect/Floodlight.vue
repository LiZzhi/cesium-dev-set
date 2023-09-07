<template>
    <CommPanel title="泛光" class="scene-panel-box">
        <div class="scene-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
    let bloom = viewer.scene.postProcessStages.bloom;
    bloom.enabled = true;
    bloom.uniforms.glowOnly = false;
    bloom.uniforms.contrast = 128;
    bloom.uniforms.brightness = -0.3;
    bloom.uniforms.delta = 1;
    bloom.uniforms.sigma = 2;
    bloom.uniforms.stepSize = 1;
});

const setVisible = (visible: boolean) => {
    viewer.scene.postProcessStages.bloom.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
