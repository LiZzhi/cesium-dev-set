<template>
    <CommPanel
        title="克里金插值"
        class="kriging-panel-box"
    >
        <div class="kriging-panel">
            <CommButton @click="dataSource.show = true">开启</CommButton>
            <CommButton @click="dataSource.show = false" contentClass="clear">关闭</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import krigingInterpolation from "@/secdev/spatialAnalysis/krigingInterpolation";
import mulitPolygon from "./assets/json/水系面.json";

let dataSource = new Cesium.CustomDataSource();
let krigings: krigingInterpolation[] = [];
let points = [
    {lon: 120.395520039742621, lat: 36.333650435565744, value: 0.5 },
    {lon: 120.385707551164103, lat: 36.325664958458958, value: 0.8 },
    {lon: 120.365056163067891, lat: 36.311192564216583, value: 0.2 },
    {lon: 120.345000093316401, lat: 36.310330379027675, value: 0.9 },
    {lon: 120.340648110934296, lat: 36.293558824281547, value: 0.3 },
]

let colors = [
    {min: 0.0, max: 0.1, color: "rgba(33, 204, 14, 1.0)"},
    {min: 0.1, max: 0.2, color: "rgba(44, 212, 72, 1.0)"},
    {min: 0.2, max: 0.3, color: "rgba(49, 222, 118, 1.0)"},
    {min: 0.3, max: 0.4, color: "rgba(46, 230, 165, 1.0)"},
    {min: 0.4, max: 0.5, color: "rgba(28, 237, 216, 1.0)"},
    {min: 0.5, max: 0.6, color: "rgba(31, 218, 242, 1.0)"},
    {min: 0.6, max: 0.7, color: "rgba(48, 169, 240, 1.0)"},
    {min: 0.7, max: 0.8, color: "rgba(50, 122, 237, 1.0)"},
    {min: 0.8, max: 0.9, color: "rgba(39, 78, 232, 1.0)"},
    {min: 0.9, max: 1.0, color: "rgba(2, 32, 227, 1.0)"},
]

onMounted(() => {
    viewer.dataSources.add(dataSource);
    points.forEach(v => {
        dataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat),
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        })
    })

    mulitPolygon.features.forEach(v => {
        krigings.push(
            new krigingInterpolation(v.geometry.coordinates[0])
        )
    });
    krigings.forEach(v => {
        let e = v.create(points, colors);

        dataSource.entities.add(e);
    })
    viewer.flyTo(krigings[0].e);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/KrigingInterpolation.scss";
</style>
