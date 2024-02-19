<template>
    <CommPanel
        title="楼层分户"
        class="household-division-box"
        @close="emits('close')"
    >
        <div class="household-division-panel">
            <el-steps :space="200" :active="status" simple>
                <el-step
                    v-for="(item, index) in stepList"
                    :key="item.label"
                    :title="item.label"
                    :icon="item.icon"
                    @click="status = item.status"
                />
            </el-steps>
        </div>
        <div class="household-division-com">
            <div class="draw-bound-box">
                <div class="btn-item">
                    <span class="text-label">绘制户型：</span>
                    <CommButton @click="drawBound">绘制</CommButton>
                </div>
                <div class="btn-item">
                    <span class="text-label clear-label">重新绘制：</span>
                    <CommButton @click="clearBound" contentClass="clear"
                        >重置</CommButton
                    >
                </div>
            </div>
            <div class="division-box" v-if="status === 1">
                <div class="btn-item">
                    <span class="text-label">户型切分：</span>
                    <CommButton @click="drawDivision">绘制</CommButton>
                </div>
                <div class="btn-item">
                    <span class="text-label warning-label">撤销切割：</span>
                    <CommButton @click="revokeDivision" contentClass="warning"
                        >撤销</CommButton
                    >
                </div>
            </div>
            <div class="draw-height-box" v-if="status === 1">
                <div class="btn-item">
                    <span class="text-label">绘制高度：</span>
                    <CommButton @click="drawHeight">绘制</CommButton>
                </div>
                <div class="btn-item">
                    <span class="text-label warning-label">撤销高度：</span>
                    <CommButton @click="revokeHeight" contentClass="warning"
                        >撤销</CommButton
                    >
                </div>
                <div class="btn-item">
                    <span class="text-label clear-label">重新绘制：</span>
                    <CommButton @click="" contentClass="clear">重置</CommButton>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Edit, Picture, UploadFilled } from "@element-plus/icons-vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import entityFactory from "@/secdev/utils/entityFactory";
import cartographicTool from "@/secdev/utils/cartographicTool";
import uuid from "@/utils/uuid";
import { Feature, MultiPolygon, Polygon } from "@turf/turf";
import { Entity } from "cesium";
import useHouseholdStore from "@/store/householdStore";

const emits = defineEmits(["close"]);
const householdStore = useHouseholdStore();
const polygonDataSource = new Cesium.CustomDataSource();
const divisionDataSource = new Cesium.CustomDataSource();
const polygonPrimitives = new Cesium.PrimitiveCollection();
let polylineList: Entity[] = [];
let pointList: Entity[][] = [];
let draw: drawShape;
const status = ref(0);
const stepList = ref([
    { label: "区域绘制", icon: Edit, status: 0 },
    { label: "户型切分", icon: Picture, status: 1 },
]);

let bound: Ref<number[][]> = ref([]);
let lineString: Ref<number[][][]> = ref([]);
let household: Ref<Feature<Polygon | MultiPolygon> | null> = ref(null);
let height: Ref<number[][]> = ref([]);

function drawBound() {
    draw.drawPolygon((positions) => {
        clearBound();
        bound.value = cartographicTool.formCartesian3S(
            positions,
            undefined,
            false
        );
        bound.value.push(bound.value[0]);
        let e = entityFactory.createPloygon(positions);
        polygonDataSource.entities.add(e);
        status.value = 1;
    });
}

function clearBound() {
    polygonDataSource.entities.removeAll();
    bound.value = [];
    clearDivision();
    status.value = 0;
}

function drawDivision() {
    draw.drawPolyline((positions) => {
        let line = cartographicTool.formCartesian3S(
            positions,
            undefined,
            false
        );
        lineString.value.push(line);
        let e = entityFactory.createPolyline(positions);
        polylineList.push(e);
        divisionDataSource.entities.add(e);
        split();
    });
}

function revokeDivision() {
    let polyline = polylineList.pop();
    polyline && divisionDataSource.entities.remove(polyline);
    lineString.value.pop();
    split();
}

function drawHeight() {
    draw.drawMultiPoint((positions) => {
        let hList: number[] = [];
        let eList: Entity[] = [];
        positions.forEach((c) => {
            let radin = Cesium.Cartographic.fromCartesian(c);
            let h = radin.height;
            hList.push(h);
            let heightStr =
                "高度:" +
                (h > 1000 ? (h / 1000).toFixed(3) + "km" : h.toFixed(3) + "m");

            let e = entityFactory.createLabelPoint(c, heightStr);
            eList.push(e);
            divisionDataSource.entities.add(e);
        });
        height.value.push(hList);
        pointList.push(eList);
        split();
    });
}

function revokeHeight() {
    let h = pointList.pop();
    if (Array.isArray(h) && h.length) {
        h.forEach((e) => {
            divisionDataSource.entities.remove(e);
        });
    }
    height.value.pop();
    split();
}

function clearDivision() {
    polylineList = [];
    pointList = [];
    divisionDataSource.entities.removeAll();
    polygonPrimitives.removeAll();
    lineString.value = [];
    household.value = null;
    height.value = [];
    status.value = 1;
}

function split() {
    polygonPrimitives.removeAll();
    if (!lineString.value.length && !height.value.length) {
        ElMessage.warning("无分层分户数据!");
        return;
    }
    // 组合所有的分割线
    let lines = lineString.value.map((v) => turf.lineString(v));
    let lineCollection = turf.featureCollection(lines);
    // 计算缓冲区
    let buffer = turf.buffer(lineCollection, 0.01, { units: "meters" });
    let bufferMultiCoords = buffer.features.map((v) => v.geometry.coordinates);
    let bufferMultiPolygon = turf.multiPolygon(bufferMultiCoords);
    // 通过线缓冲区拆分多边形
    const polygon = turf.polygon([bound.value]);
    household.value = turf.difference(polygon, bufferMultiPolygon);
    createPrimitive();
}

function createPrimitive() {
    let coords: number[][][][] = [];
    let hVal: number[][] = [];
    if (!household.value) {
        coords = [[bound.value]];
    } else if (household.value.geometry.type === "Polygon") {
        coords = [household.value.geometry.coordinates];
    } else {
        coords = household.value.geometry.coordinates;
    }
    if (!height.value.length) {
        hVal = [[0, 10000]];
    } else {
        let hList = height.value.flat(Number.POSITIVE_INFINITY) as number[];
        hList.sort((a,b) => a-b);
        for (let i = 1; i < hList.length; i++) {
            hVal.push([hList[i - 1], hList[i]]);
        }
    }
    householdStore.clearDataMap();
    coords.forEach((v, i) => {
        hVal.forEach((h, j) => {
            let uid = uuid();
            let cs = cartographicTool.toCartesian3S(v[0]);
            householdStore.setDataMap(uid, {
                geom: {
                    cartesian3S: cs,
                    height: h[0],
                    extrudedHeight: h[1],
                },
                info: {
                    uid: uid,
                    单元: i + 1 + "单元",
                    楼层: j + 1 + "层",
                }
            })
            let g = new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(cs),
                height: h[0],
                extrudedHeight: h[1],
            });
            let instance = new Cesium.GeometryInstance({
                geometry: g,
                id: uid,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.fromRandom({
                            alpha: 0.3,
                        })
                    ),
                },
            });
            polygonPrimitives.add(
                new Cesium.ClassificationPrimitive({
                    geometryInstances: instance,
                    classificationType:
                        Cesium.ClassificationType.CESIUM_3D_TILE,
                })
            );
        });
    });
}

onMounted(() => {
    draw = new drawShape(viewer);
    viewer.dataSources.add(polygonDataSource);
    viewer.dataSources.add(divisionDataSource);
    viewer.scene.primitives.add(polygonPrimitives);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/HouseholdDivision.scss";
</style>
