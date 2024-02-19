<template>
    <CommPanel title="添加数据" class="add-data-box" @close="emits('close')">
        <div class="add-data-panel">
            <div class="input-box">
                <span class="text-label">数据源：</span>
                <CommInput v-model="dataSource"></CommInput>
            </div>
            <div class="btn-box">
                <CommButton @click="addModel" class="add-data-btn">添加</CommButton>
                <CommButton @click="remove"  class="add-data-btn" contentClass="clear"
                    >移除</CommButton
                >
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { Cesium3DTileset } from "cesium";
import { ref } from "vue";

const emits = defineEmits(["close"]);
const dataSource = ref(
    "http://192.168.4.120:8310/tiltphoto/api/v1/layers/dataset/城阳建筑物-B3DM/tileset.json"
);
let model: Cesium3DTileset|undefined;

function addModel() {
    if (model) {
        remove();
    }
    model = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            // maximumScreenSpaceError: 10,
            url: dataSource.value
        })
    );
    if (model) {
        model.readyPromise.then(()=>{
            viewer.flyTo(model!);
        })
    }
}

function remove() {
    viewer.scene.primitives.remove(model);
    model = undefined;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/Add3DTileset.scss";
</style>
