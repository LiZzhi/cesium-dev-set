<template>
    <CommPanel
        title="矢量标绘"
        class="draw-panel-box"
    >
        <div class="draw-panel">
            <div class="btn-group">
                <CommButton @click="drawFunc('point')">画点</CommButton>
                <CommButton @click="drawFunc('polyline')">画线</CommButton>
                <CommButton @click="drawFunc('curve')">画曲线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="drawFunc('arc')">画弧线</CommButton>
                <CommButton @click="drawFunc('polygon')">画面</CommButton>
                <CommButton @click="drawFunc('circle')">画圆</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="drawFunc('free')">画自由线</CommButton>
                <CommButton @click="drawFunc('rectangle')">画矩形</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="revoke" class="remove" contentClass="revoke">撤销</CommButton>
                <CommButton @click="clear" class="remove" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import entityFactory from "@/secdev/utils/entityFactory"
import { Cartesian3, Entity } from "cesium";
import cartographicTool from "@/secdev/utils/cartographicTool";

let draw: drawShape;
let entityList: Entity[] = [];
const drawFunc = (type: string)=>{
    switch (type) {
        case "point":
            draw.drawPoint((position: Cartesian3) => {
                let s = cartographicTool.formCartesian3(position, false);
                console.log(position);
                console.log(s);
                let e = entityFactory.createPoint(position)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "polyline":
            draw.drawPolyline((positions: Cartesian3[]) => {
                let s = cartographicTool.formCartesian3S(positions, { z: false });
                console.log(positions);
                console.log(s);
                let e = entityFactory.createPolyline(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "arc":
            draw.drawArc((positions: Cartesian3[], node: Cartesian3[]) => {
                let e = entityFactory.createPolyline(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "curve":
            draw.drawCurve((positions: Cartesian3[], node: Cartesian3[]) => {
                let e = entityFactory.createPolyline(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "free":
            draw.drawFreePolyline((positions: Cartesian3[]) => {
                let e = entityFactory.createPolyline(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "polygon":
            draw.drawPolygon((positions: Cartesian3[]) => {
                let e = entityFactory.createPloygon(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "circle":
            draw.drawCircle((positions: Cartesian3[], distance: number) => {
                let e = entityFactory.createCircle(positions[0], distance)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
        case "rectangle":
            draw.drawRectangle((positions: Cartesian3[]) => {
                let e = entityFactory.createPloygon(positions)
                viewer.entities.add(e);
                entityList.push(e)
            })
            break;
    }
}

const revoke = () => {
    let e = entityList.pop();
    if(e){
        viewer.entities.remove(e);
        return true;
    } else {
        return false;
    }
}

const clear = () => {
    while (revoke());
}

onMounted(() => {
    draw = new drawShape(viewer);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/DrawShape.scss";
</style>
