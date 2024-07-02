<template>
    <CommPanel title="光晕扩散球" class="sector-panel-box">
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
import haloAppearance from "@/secdev/specialEffectPlot/polygon/haloAppearance";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawCircle = () => {
    let { material } = haloAppearance(viewer);
    draw.drawCircle((p, d) => {
        // let primitive = new Cesium.GroundPrimitive({
        //     geometryInstances: new Cesium.GeometryInstance({
        //         geometry: new Cesium.EllipseGeometry({
        //             center: p[0],
        //             semiMajorAxis: d,
        //             semiMinorAxis: d,
        //             vertexFormat: Cesium.VertexFormat.ALL,
        //         }),
        //     }),
        //     appearance: material,
        // });
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
