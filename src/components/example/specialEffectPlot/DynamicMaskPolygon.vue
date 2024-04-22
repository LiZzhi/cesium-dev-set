<template>
    <CommPanel title="动态遮罩" class="gradient-panel-box">
        <div class="gradient-panel">
            <div class="btn-group">
                <CommButton @click="drawPolygon">绘制</CommButton>
                <CommButton @click="clear" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import dynamicMaskAppearance from "@/secdev/specialEffectPlot/polygon/dynamicMaskAppearance";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});


const drawPolygon = ()=>{
    let { material } = dynamicMaskAppearance(viewer);
    draw.drawPolygon((ps)=>{
        let p = new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(ps),
                    vertexFormat: Cesium.VertexFormat.ALL
                })
            }),
            appearance: material,
        })

        collection.add(p);
    })
}

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/GradientPolygon.scss";
</style>