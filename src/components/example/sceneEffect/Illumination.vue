<template>
    <CommPanel title="光照" class="scene-panel-box">
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
    viewer.scene.globe.enableLighting = true;
});

const setVisible = (visible: boolean) => {
    viewer.scene.globe.enableLighting = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
