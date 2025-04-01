<template>
    <CommPanel title="实时轨迹飞行" class="sample-panel-box">
        <div class="sample-panel">
            <CommButton @click="addData">添加飞行点</CommButton>
            <CommButton @click="addSpeed" contentClass="clear">加速</CommButton>
            <CommButton @click="reset" contentClass="clear">重置</CommButton>
        </div>
    </CommPanel>
    <CommPanel title="实时参数" class="sample-info-panel">
        <div class="sample-info-box">
            <div>偏航: {{ showData?.compass_heading }}</div>
            <div>横滚: {{ showData?.roll }}</div>
            <div>俯仰: {{ showData?.pitch }}</div>
            <div>速度: {{ showData?.speed?.toFixed(1) }}</div>
            <div>高度: {{ showData?.ascent?.toFixed(1) }}</div>
            <div>里程: {{ showData?.mileage }}</div>
            <div>卫星数: {{ showData?.satellites }}</div>
            <div>GPS信号: {{ showData?.gpslevel }}</div>
            <div>起点距离: {{ showData?.distance?.toFixed(1) }}</div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import sampleEntity from "@/secdev/cameraView/sampleEntity";
import uavMessage from "./assets/json/uavMessage.json";
import { Cartesian3, PointPrimitiveCollection } from "cesium";

let se: sampleEntity;
let index = 0;
let points: PointPrimitiveCollection;
let showData: Ref<any> = ref(undefined);

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.camera.setView({
        destination: new Cesium.Cartesian3(
            -2601770.838126323,
            4447755.131281537,
            3747471.5619210475
        ),
        orientation: new Cesium.HeadingPitchRoll(
            0.6549477433441648,
            -0.5962625361824907,
            6.2831066033510306
        ),
    });
    points = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    se = new sampleEntity(viewer);
    se.init();
    se.changeAnimate(true);
    setInterval(() => {
        showData.value = se.getData()?.object;
    }, 500);
});

function addData() {
    for (let i = 1; i <= 100; i++) {
        if (uavMessage.length > index) {
            const data = uavMessage[index];
            let p = Cesium.Cartesian3.fromDegrees(
                data.longitude,
                data.latitude,
                data.height
            );
            se.addData(0.5, {
                position: p,
                object: data,
            });
            addPoint(p);
        } else {
            return;
        }
        index++;
    }
}

function addPoint(position: Cartesian3) {
    points.add({
        position: position,
        pixelSize: 1.0,
        color: Cesium.Color.BLUE,
    });
}

function addSpeed() {
    viewer.clock.multiplier ++;
}

function reset() {
    viewer.clock.multiplier = 1;
    points.removeAll();
    index = 0;
    se.destroy();
    se.init();
    se.changeAnimate(true);
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SampleEntity.scss";
</style>
