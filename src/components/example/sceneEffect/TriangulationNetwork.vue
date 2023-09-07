<template>
    <CommPanel title="地形三角网" class="scene-panel-box">
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
import { CesiumInspectorViewModel } from "cesium";

const el = document.createElement("div");
let triangleNet: CesiumInspectorViewModel

onMounted(() => {
    triangleNet = new Cesium.CesiumInspectorViewModel(viewer.scene, el);
});

const setVisible = (visible: boolean) => {
    triangleNet.wireframe = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
