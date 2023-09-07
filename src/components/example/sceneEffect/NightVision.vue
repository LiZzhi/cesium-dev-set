<template>
    <CommPanel title="夜视" class="scene-panel-box">
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

const nightVision = Cesium.PostProcessStageLibrary.createNightVisionStage();

onMounted(() => {
    viewer.scene.postProcessStages.add(nightVision);
    nightVision.enabled = true;
});

const setVisible = (visible: boolean) => {
    nightVision.enabled = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
