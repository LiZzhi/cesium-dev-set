<template>
    <div id="cesium-container"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { initViewer } from "@/utils/earth";

onMounted(() => {
    const viewer = initViewer("cesium-container");
    window.viewer = viewer;
});
</script>

<style lang="scss" scoped>
@import "./assets/style/BaseEarth.scss"
</style>
