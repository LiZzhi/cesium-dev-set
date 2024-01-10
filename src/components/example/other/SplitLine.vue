<template>
    <CommPanel
        title="分割多段线"
        class="split-panel-box"
    >
        <div class="split-panel">
            <el-radio-group v-model="radioValue" size="small">
                <el-radio
                    v-for="(item, i) in radioList"
                    :key="item.value"
                    :label="item.value"
                    border
                    >{{ item.label }}</el-radio
                >
            </el-radio-group>
            <div class="input-group">
                <span class="text-label">{{ inputLabel }}：</span>
                <CommInput
                    v-model="len"
                    :number="true"
                ></CommInput>
            </div>
            <div class="btn-group">
                <CommButton @click="drawLine" class="btn">画线</CommButton>
                <CommButton @click="clear" class="btn" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import entityFactory from "@/secdev/utils/entityFactory";
import splitLine from "@/secdev/utils/splitLine"
import { Cartesian3 } from "cesium";

enum splitType {
    COUNT=1,
    LENGTH=2,
}

let draw: drawShape;
let collection = new Cesium.PointPrimitiveCollection();
const len = ref(10);
const radioValue = ref(splitType.COUNT);
const radioList = ref([
    {label: "数量", value: splitType.COUNT},
    {label: "长度", value: splitType.LENGTH},
]);
const inputLabel = computed(()=>{
    if (radioValue.value === splitType.COUNT) {
        return "分割数量";
    } else {
        return "分割长度";
    }
});

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.globe.depthTestAgainstTerrain = false;
    draw = new drawShape(viewer);
    viewer.scene.primitives.add(collection);
});

const drawLine = () => {
    draw.drawPolyline(
        (positions) => {
            let cs: Cartesian3[];
            switch (radioValue.value) {
                case splitType.COUNT:
                    cs = splitLine.byChunk(positions, len.value);
                    break;
                case splitType.LENGTH:
                    cs = splitLine.byDistance(positions, len.value);
                    break;
                default:
                    cs = [];
                    break;
            }
            cs.forEach(v => {
                collection.add({
                    position : v,
                    pixelSize : 10.0,
                    color : Cesium.Color.RED,
                })
            });

            let e = entityFactory.createPolyline(positions);
            viewer.entities.add(e);
        }
    );
};

const clear = () => {
    collection.removeAll();
    viewer.entities.removeAll();
};
</script>

<style lang="scss" scoped>
@import "./assets/style/splitLine.scss";
</style>
