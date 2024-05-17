<template>
    <CommPanel title="单个云层" class="sector-panel-box">
        <div class="sector-panel">
            <div class="btn-group">
                <CommButton @click="drawClound">绘制</CommButton>
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.CloudCollection();
const pCollection = new Cesium.PointPrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    viewer.scene.primitives.add(pCollection);
    draw = new drawShape(viewer);
});

const drawClound = () => {
    draw.drawPoint((p) => {
        let { longitude, latitude, height } =
            Cesium.Cartographic.fromCartesian(p);
        collection.add({
            position: Cesium.Cartesian3.fromRadians(
                longitude,
                latitude,
                height + 1000
            ),
            maximumSize: new Cesium.Cartesian3(20, 12, 15),
            scale: new Cesium.Cartesian2(250, 120),
            slice: 0.5,
            color: Cesium.Color.WHITE,
            brightness: 1.0,
        });
        // pCollection.add({
        //     position: Cesium.Cartesian3.fromRadians(longitude, latitude, height + 1000),
        //     color : Cesium.Color.CYAN,
        // });
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/SectorScan.scss";
</style>
