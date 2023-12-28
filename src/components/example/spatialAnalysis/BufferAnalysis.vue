<template>
    <CommPanel title="缓冲区分析" class="buffer-panel-box">
        <div class="buffer-panel">
            <div class="input-group">
                <span class="distance-label">缓冲距离：</span>
                <CommInput v-model="distance" :number="true"></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="drawPoint" class="btn">画点</CommButton>
                <CommButton @click="drawPolyline" class="btn">画线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="drawPolygon" class="btn">画面</CommButton>
                <CommButton @click="clear" class="btn" contentClass="clear"
                    >清空</CommButton
                >
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Entity, Cartesian3 } from "cesium";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import bufferAnalysis from "@/secdev/spatialAnalysis//bufferAnalysis";
import cartographicTool from "@/secdev/utils/cartographicTool";
import entityFactory from "@/secdev/utils/entityFactory";

let draw: drawShape;
let distance = ref(100);
onMounted(() => {
    draw = new drawShape(viewer);
});

const drawPoint = () => {
    draw.drawPoint((positions) => {
        let buffer = bufferAnalysis.pointBuffer(
            cartographicTool.formCartesian3(positions),
            distance.value
        );
        let bufferPositions = cartographicTool.toCartesian3S(buffer);
        let e1 = entityFactory.createPoint(positions);
        let e2 = createBuffer(bufferPositions);
        viewer.entities.add(e1);
        viewer.entities.add(e2);
    });
};

const drawPolyline = () => {
    draw.drawPolyline((positions) => {
        let buffer = bufferAnalysis.polylineBuffer(
            cartographicTool.formCartesian3S(positions),
            distance.value
        );
        let bufferPositions = cartographicTool.toCartesian3S(buffer);
        let e1 = entityFactory.createPolyline(positions);
        let e2 = createBuffer(bufferPositions);
        viewer.entities.add(e1);
        viewer.entities.add(e2);
    });
};

const drawPolygon = () => {
    draw.drawPolygon((positions) => {
        let cs = cartographicTool.formCartesian3S(positions);
        cs.push(cs[0]);
        let buffer = bufferAnalysis.polygonBuffer([cs], distance.value);
        let bufferPositions = cartographicTool.toCartesian3S(buffer);
        let e1 = entityFactory.createPloygon(positions);
        let e2 = createBuffer(bufferPositions);
        viewer.entities.add(e1);
        viewer.entities.add(e2);
    });
};

const createBuffer = (positions: Cartesian3[]) => {
    return new Cesium.Entity({
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            material: Cesium.Color.RED.withAlpha(0.3),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
    });
};

const clear = () => {
    viewer.entities.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/BufferAnalysis.scss";
</style>
