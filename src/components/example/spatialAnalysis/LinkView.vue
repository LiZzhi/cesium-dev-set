<template>
    <CommPanel
        title="二三维视图"
        class="link-panel-box"
    >
        <div class="link-panel">
            <CommButton @click="view.openCesiumMapLink23d()">开启</CommButton>
            <CommButton @click="view.destroy()" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import linkView from "@/secdev/spatialAnalysis/linkView";

let view: linkView;

onMounted(() => {
    const $container = document.querySelector("#cesium-container") as HTMLDivElement;
    view = new linkView($container, viewer);
    view.openCesiumMapLink23d();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/LinkView.scss";
</style>
