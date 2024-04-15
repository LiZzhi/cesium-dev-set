<template>
    <CommPanel title="棱柱体" class="box-panel-box">
        <div class="box-panel">
            <div class="btn-group">
                <CommButton @click="drawPolygon(0, 100000)">绘制</CommButton>
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import createPrism from "@/secdev/specialEffectPlot/polygon/createPrism";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawPolygon = (height: number, extrudedHeight: number) => {
    draw.drawPolygon((ps) => {
        let c = createPrism(ps, height, extrudedHeight);
        collection.add(c);
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/BoundingBox.scss";
</style>
