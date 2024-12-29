<template>
    <CommPanel title="圆柱标记" class="marking-panel-box">
        <div class="marking-panel">
            <div class="btn-group">
                <span class="height-label">圆柱高度：</span>
                <CommInput
                    class="height-input"
                    v-model="height"
                    :number="true"
                ></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="drawCircle">绘制</CommButton>
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import createCylinderMarking from "@/secdev/specialEffectPlot/polygon/createCylinderMarking";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;
const height = ref(1000);

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    draw.drawCircle((p, d) => {
        let dynamicMark = createCylinderMarking(p[0], d, {
            height: height.value,
        });
        collection.add(dynamicMark);
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/CylinderMarking.scss";
</style>
