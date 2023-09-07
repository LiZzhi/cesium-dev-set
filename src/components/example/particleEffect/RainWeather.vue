<template>
    <CommPanel title="雨天效果" class="scene-panel-box">
        <div class="scene-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import rainWeather from "@/secdev/particleEffect/weather/rainWeather";
import { voidFuncType } from "@/type/common";

let destoryRain: voidFuncType|undefined = undefined;

onMounted(() => {
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
    destoryRain = rainWeather(viewer);
});

const setVisible = (visible: boolean) => {
    if (visible) {
        destoryRain && destoryRain();
        destoryRain = rainWeather(viewer);
    } else {
        destoryRain && destoryRain();
        destoryRain = undefined;
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
