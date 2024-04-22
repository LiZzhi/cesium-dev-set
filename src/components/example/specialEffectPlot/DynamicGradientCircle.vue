<template>
    <CommPanel title="动态渐变圆" class="sector-panel-box">
        <div class="sector-panel">
            <div class="btn-group">
                <CommButton @click="drawCircle">绘制</CommButton>
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import dynamicGradientCircleAppearance from "@/secdev/specialEffectPlot/polygon/dynamicGradientCircleAppearance";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    let { material } = dynamicGradientCircleAppearance(viewer);
    draw.drawCircle((p, d) => {
        let primitive = new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.EllipseGeometry({
                    center: p[0],
                    semiMajorAxis: d * 1.25,
                    semiMinorAxis: d * 1.25,
                    vertexFormat: Cesium.VertexFormat.ALL,
                }),
            }),
            appearance: material,
        });
        collection.add(primitive);
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/SectorScan.scss";
</style>
