<template>
    <CommPanel title="卫星云图" class="cloud-panel-box">
        <div class="cloud-panel">
            <div class="btn-group">
                <CommButton
                    @click="changeLayer(item.img)"
                    v-for="(item, i) in cloudList"
                    :key="item.label"
                    >{{ item.label }}</CommButton
                >
                <CommButton @click="clear" contentClass="clear"
                    >清除</CommButton
                >
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { ImageryLayer } from "cesium";
import { onMounted } from "vue";

let layer: ImageryLayer | undefined;
// http://www.weather.com.cn/radar/ 云图来源
const cloudList = [
    {
        label: "202311290859",
        img: require("./assets/img/cloud/202311290859.png"),
    },
    {
        label: "201311290914",
        img: require("./assets/img/cloud/201311290914.png"),
    },
];

let webMercatorProjection = new Cesium.WebMercatorProjection();
let p1 = webMercatorProjection.project(Cesium.Cartographic.fromDegrees(70, 4));
let p2 = webMercatorProjection.project(
    Cesium.Cartographic.fromDegrees(140, 55)
);

onMounted(() => {
    window.globalFunc.setChinaView(viewer);
    changeLayer(cloudList[0].img);
});

function changeLayer(img: string) {
    layer && viewer.imageryLayers.remove(layer);
    layer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
            url: img,
            maximumLevel: 0,
            tilingScheme: new Cesium.WebMercatorTilingScheme({
                rectangleSouthwestInMeters: new Cesium.Cartesian2(p1.x, p1.y),
                rectangleNortheastInMeters: new Cesium.Cartesian2(p2.x, p2.y),
            }),
        })
    );
}

function clear() {
    layer && viewer.imageryLayers.remove(layer);
    layer = undefined;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/CloudMap.scss";
</style>
