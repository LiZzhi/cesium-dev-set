<template>
    <CommPanel title="飞线特效" class="point-panel-box">
        <div class="point-panel">
            <CommButton @click="line.show = true">显示</CommButton>
            <CommButton @click="line.show = false" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { PrimitiveCollection } from "cesium";
import { onMounted } from "vue";
import flightLine from "@/secdev/specialEffectPlot/flightLine/flightLine";

let line: PrimitiveCollection;
onMounted(() => {
    line = flightLine([113.17, 23.8], [114.0, 22.5], {
        h: 50000,
    });
    viewer.scene.primitives.add(line);
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(112.764563, 21.155502, 83476),
        orientation: Cesium.HeadingPitchRoll.fromDegrees(16.019172, -26.09177, 0.150147)
    })
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EffectPoint.scss"
</style>
