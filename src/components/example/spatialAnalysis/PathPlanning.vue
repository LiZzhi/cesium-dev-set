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
                <CommButton @click="requset" class="plan">规划</CommButton>
                <CommButton @click="closePanel" class="clear">清除</CommButton>
            </div>
        </div>
    </CommPanel>
    <CommPanel
        title="规划结果"
        class="result-panel-box"
        v-if="show"
        @close="closePanel"
    >
        <div class="result-item-container">
            <div
                v-for="(item, i) in result"
                :key="i"
                class="result-item-box"
            >
                <div class="result-item-content">
                    <span class="result-item-title">路程全长：</span>
                    <span class="result-item-body">{{ item.distance }}</span>
                </div>
                <div class="result-item-content">
                    <span class="result-item-title">路程耗时：</span>
                    <span class="result-item-body">{{ item.duration }}</span>
                </div>
                <div class="result-item-content">
                    <span class="result-item-title">红绿灯数：</span>
                    <span class="result-item-body">{{ item.lights }}</span>
                </div>
                <div class="result-item-content">
                    <span class="result-item-title">收费路段：</span>
                    <span class="result-item-body">{{ item.toll }}</span>
                </div>
                <div class="result-item-content">
                    <span class="result-item-title">途径路段：</span>
                    <span class="result-item-body">{{ item.roads }}</span>
                </div>
                <div class="result-item-content">
                    <span class="result-item-title" style="align-self: center;">显示路线：</span>
                    <span class="result-item-body">
                        <CommButton @click="showLine(item.entity)">显示</CommButton>
                    </span>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import polylineLinkPulseMaterial from "@/secdev/specialEffectPlot/lineMaterial/polylineLinkPulseMaterial.js";
import cartographicTool from "@/secdev/utils/cartographicTool";
import coordinateOffset from "@/secdev/utils/coordinateOffset";
import entityFactory from "@/secdev/utils/entityFactory";
import { Entity } from "cesium";
import server from "@/server";
import api from "@/server/aMap/api";
import { ElMessage } from "element-plus";

let draw: drawShape;
const http = server.aMapServer;
const key = "432b84bd33de91d47d19a6cef894c723";

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
    }, 16)
}
const clearAvoidancePoint = ()=>{
    avoidanceArea.value.length = 0;
    avoidanceEntities.forEach(e=>{
        viewer.entities.remove(e);
    })
    avoidanceEntities.length = 0;
}

type resultType = {
    entity: Entity;
    distance: string;
    duration:string;
    lights: string;
    toll: string;
    roads: string;
}
let show = ref(false);
let result: Ref<resultType[]> = ref([]);
let lineEntity: undefined|Entity = undefined;
const requset = async () => {
    if(!(startPoint.value && endPoint.value)){
        ElMessage.warning("起点和终点为必选项");
        return;
    }
    // 途径点
    let approach: string[] = [];
    if(approachPoint.value.length){
        for (let i = 0; i < approachPoint.value.length; i++) {
            let cur = approachPoint.value[i];
            // 84转高德(火星)
            cur = coordinateOffset.gcj_encrypt(cur[0], cur[1]);
            approach.push(`${cur[0].toFixed(6)},${cur[1].toFixed(6)}`);
        }
    }
    // 避让区
    let avoidance: string[] = [];
    if(avoidanceArea.value.length){
        for (let i = 0; i < avoidanceArea.value.length; i++) {
            let areaStr: string[] = [];
            const curArea = avoidanceArea.value[i];
            for (let j = 0; j < curArea.length; j++) {
                let cur = curArea[j];
                // 84转高德(火星)
                cur = coordinateOffset.gcj_encrypt(cur[0], cur[1]);
                areaStr.push(`${cur[0].toFixed(6)},${cur[1].toFixed(6)}`);
            }
            avoidance.push(areaStr.join(";"));
        }
    }

    result.value.length = 0;
    closePanel();

    // wgs84转火星
    let originArr = startPoint.value.split(",");
    let origin = coordinateOffset.gcj_encrypt(Number(originArr[0]), Number(originArr[1])).join(",");

    let destinationArr = endPoint.value.split(",");
    let destination = coordinateOffset.gcj_encrypt(Number(destinationArr[0]), Number(destinationArr[1])).join(",");
    const res = await http.get(api.driving, {
        params: {
            key: key,
            origin: origin,
            destination: destination,
            strategy: "10", // 策略，当前为高德地图默认策略
            waypoints: approach.join(";"),
            avoidpolygons: avoidance.join("|"),
            output: "JSON", // 返回数据格式类型
            extensions: "all",  // 返回全部信息
        }
    })
    if(res.status === 200 && res.data.status === "1"){
        let data = res.data.route.paths;
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const steps = element.steps;
            let roads: string[] = [];
            let lines: string[] = [];
            for (let j = 0; j < steps.length; j++) {
                steps[j].road && roads.push(steps[j].road);
                steps[j].polyline && lines.push(steps[j].polyline);
            }
            result.value.push({
                distance: element.distance + "米",
                duration: (element.duration/3600).toFixed(2) + "时",
                lights: element.traffic_lights + "个",
                toll: element.toll_distance + "米",
                roads: roads.join("、") + "。",
                entity: new Cesium.Entity({
                    id: '路径规划-方案-' + i,
                    name: '路径规划-方案-' + i,
                    polyline: {
                        positions: analyticCoord(lines.join(";")),
                        width: 15,
                        material: new polylineLinkPulseMaterial({
                            color: Cesium.Color.fromRandom().withAlpha(0.7),
                            duration: 5000 //时间 控制速度
                        }),
                        clampToGround: true
                    }
                })
            })
        }
        show.value = true;
        showLine(result.value[0].entity);
    }
}

const showLine = (e: Entity)=>{
    lineEntity && viewer.entities.remove(lineEntity);
    lineEntity = e;
    viewer.entities.add(e);
}

const closePanel = ()=>{
    show.value = false;
    lineEntity && viewer.entities.remove(lineEntity);
    lineEntity = undefined;
}

const analyticCoord = (coordStr:string) => {
    let result: number[] = [];
    let coords = coordStr.split(";");
    coords.forEach((v)=>{
        let c = v.split(",");
        // 高德(火星)转84
        let coord84 = coordinateOffset.gcj_decrypt(Number(c[0]), Number(c[1]));
        result.push(coord84[0]);
        result.push(coord84[1]);
    })
    return Cesium.Cartesian3.fromDegreesArray(result);
}
</script>

<style lang="scss" scoped>
@import "./assets/style/PathPlanning.scss";
</style>
