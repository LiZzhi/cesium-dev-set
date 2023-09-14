<template>
    <CommPanel title="限高分析" class="height-panel-box">
        <div class="height-panel">
            <div class="height-slider">
                <span class="slider-label">限高：</span>
                <CommSlider v-model="height" :min="400" :max="500" :step="1"></CommSlider>
            </div>
            <div class="btn-group">
                <CommButton @click="show" class="comm-btn">显示</CommButton>
                <CommButton @click="heightLimit.destroy()" class="comm-btn" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import heightLimitAnalysis from "@/secdev/spatialAnalysis/heightLimitAnalysis";

let heightLimit: heightLimitAnalysis;
const height = ref(450);   // 调节高度
watch(height, (v)=>{
    heightLimit.height = v;
})

const show = ()=>{
    heightLimit.init();
    heightLimit.height = height.value;
}

onMounted(() => {
    const h = new Cesium.PolygonHierarchy([
        new Cesium.Cartesian3(-1715231.805688242, 4993415.26274802, 3567023.0589824845),
        new Cesium.Cartesian3(-1715559.2425164199, 4993300.092233208, 3567023.303395297),
        new Cesium.Cartesian3(-1715645.754204674, 4993545.225431734, 3566639.949250538),
        new Cesium.Cartesian3(-1715317.7878784728, 4993658.854461889, 3566638.5962640895),
    ])
    heightLimit = new heightLimitAnalysis(viewer, h, height.value);
    heightLimit.init();

    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    )
});
</script>

<style lang="scss" scoped>
@import "./assets/style/HeightLimitAnalysis.scss";
</style>
