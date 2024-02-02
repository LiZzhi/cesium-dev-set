<template>
    <CommPanel title="扩散圈" class="scan-panel-box">
        <div class="scan-panel">
            <div class="btn-group">
                <CommButton @click="drawCircle('red')">红色扩散线</CommButton>
                <CommButton @click="drawCircle('blue')">蓝色扩散线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="drawCircle('yellow')">黄色扩散线</CommButton>
                <CommButton @click="drawCircle('green')">绿色扩散线</CommButton>
            </div>
            <div class="btn-group">
                <CommButton @click="clear" class="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Color } from "cesium";
import diffusedAppearance from "@/secdev/specialEffectPlot/polygon/diffusedAppearance";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
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
        let primitive = new Cesium.GroundPrimitive({
			geometryInstances: new Cesium.GeometryInstance({
				geometry: new Cesium.EllipseGeometry({
					center: p[0],
					semiMajorAxis: d,
					semiMinorAxis: d,
					vertexFormat: Cesium.VertexFormat.ALL
				}),
			}),
			appearance: diffusedAppearance({
                color
            })
		});
        collection.add(primitive);
    })
}

const clear = ()=>{
    collection.removeAll();
}
</script>

<style lang="scss" scoped>
@import "./assets/style/RadarScan.scss";
</style>