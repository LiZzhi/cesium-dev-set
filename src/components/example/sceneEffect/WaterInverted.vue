<template>
    <CommPanel title="水面倒影" class="scene-panel-box">
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
import { GroundPrimitive } from "cesium";
import waterInverted from "@/secdev/sceneEffect/water/waterInverted";

let water: GroundPrimitive
let ps = [
    new Cesium.Cartesian3(-1715168, 4993418, 3567049),
    new Cesium.Cartesian3(-1715625, 4993258, 3567055),
    new Cesium.Cartesian3(-1715710, 4993546, 3566612),
    new Cesium.Cartesian3(-1715245, 4993696, 3566619),
]

onMounted(() => {
    const waterObj = waterInverted(new Cesium.PolygonHierarchy(ps));
    water = viewer.scene.primitives.add(waterObj.primitive);
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});

const setVisible = (visible: boolean) => {
    water.show = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
