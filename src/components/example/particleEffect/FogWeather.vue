<template>
    <CommPanel title="雾天效果" class="weather-panel-box">
        <div class="weather-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import fogWeather from "@/secdev/particleEffect/weather/fogWeather";
import { voidFuncType } from "@/type/common";

let destoryFog: voidFuncType|undefined = undefined;

onMounted(() => {
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
    destoryFog = fogWeather(viewer);
});

const setVisible = (visible: boolean) => {
    if (visible) {
        destoryFog && destoryFog();
        destoryFog = fogWeather(viewer);
    } else {
        destoryFog && destoryFog();
        destoryFog = undefined;
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/Weather.scss";
</style>
