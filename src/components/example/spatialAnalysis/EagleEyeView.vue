<template>
    <CommPanel
        title="鹰眼视图"
        class="eye-panel-box"
    >
        <div class="eye-panel">
            <CommButton @click="view.init(exampleBody)">开启</CommButton>
            <CommButton @click="view.destory()" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import eagleEyeView from "@/secdev/spatialAnalysis/eagleEyeView";

let view: eagleEyeView;
let exampleBody: HTMLElement;

onMounted(() => {
    exampleBody = document.querySelector(".example-body") as HTMLElement;
    view = new eagleEyeView(viewer);
    view.init(exampleBody);

    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EagleEyeView.scss";
</style>
