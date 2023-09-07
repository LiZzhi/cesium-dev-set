<template>
    <CommPanel
        title="鹰眼视图"
        class="link-panel-box"
    >
        <div class="link-panel">
            <CommButton @click="">开启</CommButton>
            <CommButton @click="" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import eagleEyeView from "@/secdev/spatialAnalysis/eagleEyeView";

let view: eagleEyeView;

onMounted(() => {
    const exampleBody = document.querySelector(".example-body") as HTMLElement;
    view = new eagleEyeView(viewer);
    view.init(exampleBody);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/LinkView.scss";
</style>
