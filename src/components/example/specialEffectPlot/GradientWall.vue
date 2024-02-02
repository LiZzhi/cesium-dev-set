<template>
    <CommPanel title="特效点" class="wall-panel-box">
        <div class="wall-panel">
            <div class="btn-group">
                <CommButton @click="drawWall()">绘制墙体</CommButton>
                <CommButton @click="clear" class="clear">清除</CommButton>
            </div>
            <div class="btn-group">
                <span class="height-label">墙体高度：</span>
                <CommInput
                    class="height-input"
                    v-model="height"
                    :number="true"
                ></CommInput>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import gradationWallImage from "@/secdev/specialEffectPlot/wall/gradationWallImage";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;
let height = ref(100);
let dataSource = new Cesium.CustomDataSource();

const clear = () => {
    dataSource.entities.removeAll();
};

const drawWall = () => {
    let color = Cesium.Color.fromRandom({
        alpha: 1.0,
    });
    let img = gradationWallImage({
        0.0: color.withAlpha(1.0).toCssColorString().replace(")", ",1.0)"),
        0.045: color.withAlpha(0.8).toCssColorString(),
        0.1: color.withAlpha(0.6).toCssColorString(),
        0.15: color.withAlpha(0.4).toCssColorString(),
        0.37: color.withAlpha(0.2).toCssColorString(),
        0.54: color.withAlpha(0.1).toCssColorString(),
        1.0: color.withAlpha(0).toCssColorString(),
    });
    draw.drawPolygon(ps => {
        if (!ps[0].equals(ps[ps.length-1])) {
            ps.push(ps[0]);
        }
        dataSource.entities.add({
            wall: {
                positions: ps,
                maximumHeights: new Array(ps.length).fill(200),
                minimumHeights: new Array(ps.length).fill(0),
                material: new Cesium.ImageMaterialProperty({
                    transparent: true, //设置透明
                    image: img,
                }),
            },
        })
    })
}

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    draw = new drawShape(viewer);
    viewer.dataSources.add(dataSource);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/GradientWall.scss";
</style>
