<template>
    <CommPanel
        title="海陆判断"
        class="land-panel-box"
    >
        <div class="land-panel">
            <CommButton @click="drawPoint">绘制</CommButton>
            <CommButton @click="clear" contentClass="clear">清空</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import pointInPolygon from "@/secdev/utils/pointInPolygon";
import cartographicTool from "@/secdev/utils/cartographicTool";
import entityFactory from "@/secdev/utils/entityFactory";
import countries from "./assets/json/countries.json";

let land:number[][][][] = []
let draw: drawShape;

for (let i = 0; i < countries.features.length; i++) {
    const element: any = countries.features[i].geometry;
    if(element.type === "MultiPolygon"){
        element.coordinates.forEach((v: any) => {
            land.push(v);
        })
    } else {
        land.push(element.coordinates)
    }
}

onMounted(() => {
    draw = new drawShape(viewer);
    viewer.camera.flyHome(1);
});

const drawPoint = ()=>{
    draw.drawPoint((position)=>{
        let isLand = false;
        let cat = cartographicTool.formCartesian3(position);
        for (let index = 0; index < land.length; index++) {
            isLand = pointInPolygon(cat[0], cat[1], land[index]);
            if(isLand){
                break;
            }
        }
        let text = isLand?"陆地":"海洋";
        let e = entityFactory.createLabelPoint(position, text);
        viewer.entities.add(e);
    })
}

const clear = ()=>{
    viewer.entities.removeAll();
}
</script>

<style lang="scss" scoped>
@import "./assets/style/PointIsInLand.scss";
</style>
