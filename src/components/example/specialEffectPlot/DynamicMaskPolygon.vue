<template>
    <CommPanel title="动态遮罩" class="mask-panel-box">
        <div class="mask-panel">
            <div class="btn-group">
                <CommButton @click="drawPolygon(1)">遮罩1</CommButton>
                <CommButton @click="drawPolygon(2)">遮罩2</CommButton>
            </div>
            <div class="btn-group">
                <CommButton
                    @click="clear"
                    class="clear"
                    contentClass="clear-text"
                    >清空</CommButton
                >
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import dynamicMaskAppearance from "@/secdev/specialEffectPlot/polygon/dynamicMaskAppearance";
import dynamicMaskAppearance2 from "@/secdev/specialEffectPlot/polygon/dynamicMaskAppearance2";
import { MaterialAppearance } from "cesium";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    draw = new drawShape(viewer);
});

const drawPolygon = (type: number) => {
    let m: MaterialAppearance;
    switch (type) {
        case 1:
            m = dynamicMaskAppearance(viewer).material;
            break;
        case 2:
            m = dynamicMaskAppearance2(viewer).material;
            break;
        default:
            return;
            break;
    }
    draw.drawPolygon((ps) => {
        let p = new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(ps),
                    vertexFormat: Cesium.VertexFormat.ALL,
                }),
            }),
            appearance: m,
        });

        collection.add(p);
    });
};

const clear = () => {
    collection.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/DynamicMaskPolygon.scss";
</style>
