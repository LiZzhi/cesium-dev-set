<template>
    <CommPanel title="电光特效" class="sector-panel-box">
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
import electricLightAppearance from "@/secdev/specialEffectPlot/polygon/electricLightAppearance";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    let { material } = electricLightAppearance(viewer, {
        alpha: 0.8
    });
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
