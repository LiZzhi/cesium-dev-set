<template>
    <CommPanel title="特效点" class="wall-panel-box">
        <div class="wall-panel">
            <div class="btn-group">
                <CommButton @click="drawWall('vertical')">纵向墙体</CommButton>
                <CommButton @click="drawWall('horizontal')">横向墙体</CommButton>
            </div>
            <div class="btn-group">
                <span class="height-label">墙体高度：</span>
                <CommInput
                    class="height-input"
                    v-model="height"
                    :number="true"
                ></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="clear" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import dynamicWallMaterial from "@/secdev/specialEffectPlot/wall/dynamicWallMaterial";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";

let draw: drawShape;
let height = ref(100);
let collection = new Cesium.PrimitiveCollection();

const clear = () => {
    collection.removeAll();
};

const drawWall = (type: "vertical"|"horizontal") => {
    draw.drawPolygon(ps => {
        if (!ps[0].equals(ps[ps.length-1])) {
            ps.push(ps[0]);
        }
        let geo = new Cesium.WallGeometry({
            positions : ps,
            maximumHeights: new Array(ps.length).fill(height.value),
            minimumHeights: new Array(ps.length).fill(0),
        });

        collection.add(
            new Cesium.Primitive({
                geometryInstances : new Cesium.GeometryInstance({
                    geometry: geo
                }),
                appearance : new Cesium.MaterialAppearance({
                    material: dynamicWallMaterial({
                        type,
                        direction: type === "vertical"?false:true,
                        image: type === "vertical"?
                            require("./assets/img/verticalWall.png"):
                            require("./assets/img/horizontalWall.png"),
                    }),
                })
            })
        )
    })
}

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    draw = new drawShape(viewer);
    viewer.scene.primitives.add(collection);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/DynamicWall.scss";
</style>
