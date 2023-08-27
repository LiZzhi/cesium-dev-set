<template>
    <CommPanel title="特效线" class="line-panel-box">
        <div class="line-panel">
            <div class="btn-group">
                <CommButton
                    v-for="(item, i) in lineList"
                    :key="item.name"
                    @click="show(lines[i])"
                    class="line-btn"
                    >{{ item.label }}</CommButton
                >
            </div>
            <div class="btn-group">
                <CommButton @click="hidden" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";
import { Entity } from "cesium";
import polylineArrowMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineArrowMaterial.js";
import polylineEnergyTransMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineEnergyTransMaterial.js";
import polylineLightingMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineLightingMaterial.js";
import polylineLinkPulseMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineLinkPulseMaterial.js";
import polylineMigrateMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineMigrateMaterial.js";
import polylineSpriteMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineSpriteMaterial.js";
import polylineSuperMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineSuperMaterial.js";
import polylineTrailMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineTrailMaterial.js";
import polylineVolumeTrialMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineVolumeTrialMaterial.js";

type lineListType = {
    label: string;
    name: string;
    material: any;
    params: Record<any, any>;
};

const lines: Entity[] = [];

const hidden = () => {
    lines.forEach((v) => {
        v.show = false;
    });
};

const show = (entity: Entity) => {
    entity.show = true;
};
onMounted(() => {
    lines.length = 0;
    lineList.value.forEach((v, i) => {
        lines.push(
            viewer.entities.add({
                polyline: {
                    positions: linePositions[i],
                    width: 12,
                    // material: new Cesium.Material[v.name](v.params),
                    material: new v.material(v.params),
                    clampToGround: true,
                },
            })
        );
    });

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108, 30, 1000000),
    });
});

const lineList: Ref<lineListType[]> = ref([
    {
        label: "箭头线",
        name: "polylineArrowMaterial",
        material: polylineArrowMaterial,
        params: { color: Cesium.Color.AQUA, duration: 800, count: 3 },
    },
    {
        label: "传输线",
        name: "polylineEnergyTransMaterial",
        material: polylineEnergyTransMaterial,
        params: { color: Cesium.Color.RED, duration: 2000, count: 3 },
    },
    {
        label: "发光线",
        name: "polylineLightingMaterial",
        material: polylineLightingMaterial,
        params: Cesium.Color.AQUA,
    },
    {
        label: "脉冲线",
        name: "polylineLinkPulseMaterial",
        material: polylineLinkPulseMaterial,
        params: { color: Cesium.Color.RED, duration: 5000 },
    },
    {
        label: "迁徙线",
        name: "polylineMigrateMaterial",
        material: polylineMigrateMaterial,
        params: { color: new Cesium.Color(1, 0.79, 0.15, 1), duration: 2000 },
    },
    {
        label: "精灵线",
        name: "polylineSpriteMaterial",
        material: polylineSpriteMaterial,
        params: { duration: 2000 },
    },
    {
        label: "超级线",
        name: "polylineSuperMaterial",
        material: polylineSuperMaterial,
        params: { color: Cesium.Color.RED, duration: 2000 },
    },
    {
        label: "尾迹线",
        name: "polylineTrailMaterial",
        material: polylineTrailMaterial,
        params: {
            speed: 5 * Math.random(),
            color: Cesium.Color.CYAN,
            percent: 0.5,
            gradient: 0.01,
        },
    },
    {
        label: "流动管线",
        name: "polylineVolumeTrialMaterial",
        material: polylineVolumeTrialMaterial,
        params: { color: Cesium.Color.RED, duration: 5000, count: 5 },
    },
]);

const linePositions = [
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
    [
        new Cesium.Cartesian3(
            -1705722.7375782044,
            5456272.240635795,
            2818985.3064158773
        ),
        new Cesium.Cartesian3(
            -1707465.3050721162,
            5455799.126313257,
            2818846.9912274643
        ),
        new Cesium.Cartesian3(
            -1709648.901559206,
            5455193.614325796,
            2818696.3690761398
        ),
    ],
];
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectLine.scss";
</style>
