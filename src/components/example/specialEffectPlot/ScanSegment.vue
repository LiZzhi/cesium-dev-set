<template>
    <CommPanel title="雷达扫描圈" class="scan-panel-box">
        <div class="scan-panel">
            <div class="btn-group">
                <CommButton @click="drawCircle('red')">红色扫描线</CommButton>
                <CommButton @click="drawCircle('blue')">蓝色扫描线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="drawCircle('yellow')">黄色扫描线</CommButton>
                <CommButton @click="drawCircle('green')">绿色扫描线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { PostProcessStage, Color } from "cesium";
import scanSegment from "@/secdev/specialEffectPlot/plot/scanSegment";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let scan: scanSegment;
let draw: drawShape;

let segmentList:PostProcessStage[] = [];
onMounted(() => {
    // 开启深度
    viewer.scene.globe.depthTestAgainstTerrain = true;

    scan = new scanSegment(viewer);
    draw = new drawShape(viewer);
});

const drawCircle = (colorStr: string)=>{
    let color: Color;
    switch (colorStr) {
        case "yellow":
            color = Cesium.Color.YELLOW;
            break;
        case "blue":
            color = Cesium.Color.BLUE;
            break;
        case "green":
            color = Cesium.Color.GREEN;
            break;
        default:
            color = Cesium.Color.RED;
            break;
    }
    draw.drawCircle((p, d)=>{
        let segment = scan.create(p[0], d, color, 1000);
        segmentList.push(segment);
    })
}

const clear = ()=>{
    segmentList.forEach(v=>{
        scan.remove(v);
    })
    segmentList.length = 0;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/RadarScan.scss";
</style>