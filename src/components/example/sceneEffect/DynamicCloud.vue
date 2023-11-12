<template>
    <CommPanel title="动态云层" class="scene-panel-box">
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
import { Primitive } from "cesium";
import dynamicCloud from "@/secdev/sceneEffect/cloud/dynamicCloud";

let primitive: Primitive|undefined;
let interVal: number|undefined;
onMounted(() => {
    create();
});

const create = ()=>{
    let d = dynamicCloud(viewer);
    primitive = d.cloudPrimitive;
    interVal = d.interVal;
}

const clear = ()=>{
    viewer.scene.primitives.remove(primitive);
    clearInterval(interVal);
    primitive = undefined;
    interVal = undefined;
}

const setVisible = (visible: boolean) => {
    clear();
    if (visible) {
        create();
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
