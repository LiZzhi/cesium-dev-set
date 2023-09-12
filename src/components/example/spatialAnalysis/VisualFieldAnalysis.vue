<template>
    <CommPanel title="可视域分析" class="visual-panel-box">
        <div class="visual-panel">
            <div class="slider-group">
                <div
                    class="slider-item"
                    v-for="(item, i) in menuList"
                    :key="item.label"
                >
                    <div class="slider-label-box">
                        <span class="slider-label">{{ item.label }}</span>
                    </div>
                    <div class="slider-box">
                        <CommSlider
                            v-model="item.data"
                            :min="item.min"
                            :max="item.max"
                            :step="item.step"
                        >
                        </CommSlider>
                    </div>
                </div>
            </div>
            <div class="btn-group">
                <CommButton @click="setVisualField">开启</CommButton>
                <CommButton @click="revoke" contentClass="revoke">撤回</CommButton>
                <CommButton @click="destroy" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import visualFieldAnalysis from "@/secdev/spatialAnalysis/visualFieldAnalysis";
import visualField from "@/secdev/spatialAnalysis/visualField";
import getHeading from "@/secdev/utils/getHeading";
import getPitch from "@/secdev/utils/getPitch";

let analysis: visualFieldAnalysis;
let draw: drawShape;
let visualFields: visualField[] = [];

onMounted(() => {
    viewer.scene.globe.depthTestAgainstTerrain = true;
    draw = new drawShape(viewer);
    analysis = new visualFieldAnalysis(viewer);
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});

const horizontalAngle = ref(60);
const verticalAngle = ref(30);

const menuList = ref([
    { label: "水平张角", data: horizontalAngle, min: 0, max: 90, step: 1 },
    { label: "垂直张角", data: verticalAngle, min: 0, max: 90, step: 1 },
]);

const setVisualField = () => {
    draw.drawPolyline(
        (position) => {
            let heading = Cesium.Math.toDegrees(getHeading(position[0], position[1]));
            let pitch = Cesium.Math.toDegrees(getPitch(position[0], position[1]));
            let v = analysis.create(position[0], {
                show: false,
                distance: Cesium.Cartesian3.distance(position[0], position[1]),
                heading, pitch,
                horizontalAngle: horizontalAngle.value,
                verticalAngle: verticalAngle.value,
            });
            visualFields.push(v);
            v.init();
        },
        {
            maxNode: 2,
        }
    );
};

const revoke = () => {
    const v = visualFields.pop();
    v && v.remove();
    return v;
}

const destroy = () => {
    while (revoke());
}
</script>

<style lang="scss" scoped>
@import "./assets/style/VisualFieldAnalysis.scss";
</style>
