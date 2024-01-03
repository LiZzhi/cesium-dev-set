<template>
    <CommPanel title="坡度分析" class="slope-panel-box">
        <div class="slope-panel">
            <div class="slope-slider">
                <span class="slider-label">系数：</span>
                <CommSlider
                    v-model="steps"
                    :min="10"
                    :max="100"
                    :step="1"
                ></CommSlider>
            </div>
            <div class="btn-group">
                <CommButton @click="drawRect" class="comm-btn">绘制</CommButton>
                <CommButton
                    @click="destroy"
                    class="comm-btn"
                    contentClass="clear"
                    >清空</CommButton
                >
            </div>
        </div>
    </CommPanel>
    <CommPanel title="坡度图例" class="slope-legend-box">
        <div class="legend-item-box">
            <div class="legend-item" v-for="(item, i) in legendList" :key="i">
                <span
                    class="color-rect"
                    :style="{ backgroundColor: item.color }"
                ></span>
                <span class="legend-label">{{
                    Number(item.min).toFixed(2)
                }}</span>
                <span style="color: #fff">-</span>
                <span class="legend-label">{{
                    Number(item.max).toFixed(2)
                }}</span>
                <span class="legend-label">{{
                    `( ${((item.count/sum)*100).toFixed(2)}% )`
                }}</span>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import slopeAnalysis, {
    countColorType,
} from "@/secdev/spatialAnalysis/slopeAnalysis";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import cartographicTool from "@/secdev/utils/cartographicTool";

let analysis: slopeAnalysis;
let draw: drawShape;
let ps = new Cesium.PrimitiveCollection();
const steps = ref(10); // 调节插值步长
const legendList: Ref<countColorType[]> = ref([]);
let sum = 1;
const drawRect = () => {
    draw.drawRectangle(async (positions) => {
        let result = await analysis.create(
            cartographicTool.formCartesian3S(positions),
            steps.value
        );
        ps.add(result.primitives);
        sum = result.countColor.reduce((v1, v2) => v1 + v2.count, 0);
        legendList.value = result.countColor;
    });
};

const destroy = () => {
    ps.removeAll();
    legendList.value = [];
};

onMounted(() => {
    analysis = new slopeAnalysis(viewer);
    draw = new drawShape(viewer);
    viewer.scene.primitives.add(ps);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/SlopeAnalysis.scss";
</style>
