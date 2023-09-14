<template>
    <CommPanel
        title="地球自转"
        class="rotation-panel-box"
    >
        <div class="rotation-panel">
            <CommButton @click="rote.start()">开启</CommButton>
            <CommButton @click="rote.stop()" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import rotation from "@/secdev/cameraView/rotation";

let rote: rotation;

onMounted(() => {
    rote = new rotation(viewer);
    rote.start();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/Rotation.scss";
</style>
