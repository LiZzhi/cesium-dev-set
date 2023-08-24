<template>
    <div id="cesium-container"></div>
    <CommPanel
        title="二三维视图"
        class="link-panel-box"
    >
        <div class="link-panel">
            <CommButton @click="view.openCesiumMapLink23d()">开启</CommButton>
            <CommButton @click="view.destroy()" class="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import linkView from "@/secdev/spatialAnalysis/linkView";

let view: linkView;

onMounted(() => {
    const viewer = initViewer("cesium-container");
    const $container = document.querySelector("#cesium-container") as HTMLDivElement;
    view = new linkView($container, viewer);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/LinkView.scss";
</style>
