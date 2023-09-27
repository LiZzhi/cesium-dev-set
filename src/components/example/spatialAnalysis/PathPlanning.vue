<template>
    <CommPanel
        title="路径规划"
        class="plan-panel-box"
    >
        <div class="plan-panel">
            <div class="plan-choose-box">
                <div class="plan-choose-container">
                    <span class="plan-choose-label">起点：</span>
                    <CommInput
                        placeholder="请选择起点"
                        v-model="startPoint"
                        :readonly="true"
                        class="plan-choose-input1"
                    ></CommInput>
                    <CommButton @click="chooseStartPoint">选点</CommButton>
                </div>
                <div class="plan-choose-container">
                    <span class="plan-choose-label">终点：</span>
                    <CommInput
                        placeholder="请选择终点"
                        v-model="endPoint"
                        :readonly="true"
                        class="plan-choose-input1"
                    ></CommInput>
                    <CommButton @click="chooseEndPoint">选点</CommButton>
                </div>
                <div class="plan-choose-container">
                    <span class="plan-choose-label">途径点：</span>
                    <CommInput
                        placeholder="无途径点"
                        v-model="approachPointNum"
                        :readonly="true"
                        class="plan-choose-input2"
                    ></CommInput>
                    <CommButton @click="chooseApproachPoint">添加</CommButton>
                    <CommButton @click="clearApproachPoint">重置</CommButton>
                </div>
                <div class="plan-choose-container">
                    <span class="plan-choose-label">避让区：</span>
                    <CommInput
                        placeholder="无避让区"
                        v-model="avoidanceAreaNum"
                        :readonly="true"
                        class="plan-choose-input2"
                    ></CommInput>
                    <CommButton @click="chooseAvoidancePoint">添加</CommButton>
                    <CommButton @click="clearAvoidancePoint">重置</CommButton>
                </div>
            </div>
            <div class="plan-btn-box">
                <CommButton @click="" class="plan">规划</CommButton>
                <CommButton @click="" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import cartographicTool from "@/secdev/utils/cartographicTool";
import entityFactory from "@/secdev/utils/entityFactory";
import { Entity } from "cesium";

let draw: drawShape;

onMounted(() => {
    draw = new drawShape(viewer);
});

let startEntity: Entity|undefined;  // 起点实体
const startPoint = ref(""); // 起点坐标
const chooseStartPoint = ()=>{
    startEntity && viewer.entities.remove(startEntity);
    startEntity = undefined;
    startPoint.value = "";
    draw.drawPoint(position => {
        let cat = cartographicTool.formCartesian3(position);
        startPoint.value = `${cat.longitude.toFixed(6)},${cat.latitude.toFixed(6)}`;
        startEntity = entityFactory.createLabelPoint(position, "起点");
        viewer.entities.add(startEntity);
    })
}

let endEntity: Entity|undefined;  // 终点实体
const endPoint = ref("");   // 终点坐标
const chooseEndPoint = ()=>{
    endEntity && viewer.entities.remove(endEntity);
    endEntity = undefined;
    endPoint.value = "";
    draw.drawPoint(position => {
        let cat = cartographicTool.formCartesian3(position);
        endPoint.value = `${cat.longitude.toFixed(6)},${cat.latitude.toFixed(6)}`;
        endEntity = entityFactory.createLabelPoint(position, "终点");
        viewer.entities.add(endEntity);
    })
}


const approachPoint: Ref<number[][]> = ref([]);   // 途径点坐标数组
const approachEntities: Entity[] = [];   // 途径点实体数组
const approachPointNum = computed(()=>{
    // 途径点数量
    let length = approachPoint.value.length;
    if (length) {
        return length + "";
    } else {
        return "";
    }
})
const chooseApproachPoint = ()=>{
    draw.drawPoint(position => {
        let cat = cartographicTool.formCartesian3(position);
        let point = [cat.longitude, cat.latitude];
        let e = entityFactory.createLabelPoint(position, `途径点${approachEntities.length}`);
        approachPoint.value.push(point);
        approachEntities.push(e);
        viewer.entities.add(e);
    })
}

const clearApproachPoint = ()=>{
    approachPoint.value.length = 0;
    approachEntities.forEach(e=>{
        viewer.entities.remove(e);
    })
    approachEntities.length = 0;
}

const avoidanceArea: Ref<number[][][]> = ref([]); // 避让区域坐标数组
const avoidanceEntities: Entity[] = [];   // 避让区域实体数组
const avoidanceAreaNum = computed(()=>{
    // 避让区域数量
    let length = avoidanceArea.value.length;
    if (length) {
        return length + "";
    } else {
        return "";
    }
})

const chooseAvoidancePoint = ()=>{
    draw.drawPolygon(positions => {
        let cats = cartographicTool.formCartesian3S(positions);
        let polygon = cats.map(cat => [cat.longitude, cat.latitude]);
        let e = entityFactory.createLabelPloygon(positions, `避让区${avoidanceEntities.length}`);
        avoidanceArea.value.push(polygon);
        avoidanceEntities.push(e);
        viewer.entities.add(e);
    })
}
const clearAvoidancePoint = ()=>{
    avoidanceArea.value.length = 0;
    avoidanceEntities.forEach(e=>{
        viewer.entities.remove(e);
    })
    avoidanceEntities.length = 0;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/PathPlanning.scss";
</style>
