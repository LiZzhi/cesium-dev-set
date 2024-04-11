<template>
    <CommPanel title="球体扩散" class="sector-panel-box">
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
import flowAppearance from "@/secdev/specialEffectPlot/polygon/flowAppearance";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    let { material } = flowAppearance(viewer);
    draw.drawCircle((p, d) => {
        let primitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.EllipsoidGeometry({
                    radii: new Cesium.Cartesian3(d, d, d),
                    maximumCone: Cesium.Math.PI_OVER_TWO,
                }),
                modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(p[0]),
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
