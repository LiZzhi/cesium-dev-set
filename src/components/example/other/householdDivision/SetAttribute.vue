<template>
    <div>
        <CommPanel title="分配属性" class="set-attribute-box">
            <div class="table-container">
                <div class="add-cloumn-box">
                    <span class="text-label">属性名称：</span>
                    <CommInput
                        class="add-cloumn-input"
                        v-model="newCloumn"
                        placeholder="请输入新的属性名称"
                    />
                    <CommButton class="add-cloumn-btn" @click="addCloumn"
                        >添加</CommButton
                    >
                    <CommButton class="add-cloumn-btn" @click="exportData"
                        >导出</CommButton
                    >
                    <CommButton class="add-cloumn-btn" @click="exportGeoJson"
                        >导出geoJson</CommButton
                    >
                </div>
                <el-table :data="tableData" border>
                    <el-table-column prop="uid" label="唯一ID" width="120">
                        <template #default="scope">
                            <div
                                class="uid-label"
                                @click.stop="highLightPrimitive(scope.row.uid)"
                            >
                                {{ scope.row.uid }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="统一名称" width="240">
                        <template #default="scope">
                            <div class="table-item-scope">
                                <CommInput
                                    v-model="householdName"
                                    placeholder="楼宇名称"
                                />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="单元" width="240">
                        <template #default="scope">
                            <div class="table-item-scope">
                                <CommInput
                                    v-model="tableData[scope.$index]['单元']"
                                    placeholder="单元名称"
                                />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="楼层" width="240">
                        <template #default="scope">
                            <div class="table-item-scope">
                                <CommInput
                                    v-model="tableData[scope.$index]['楼层']"
                                    placeholder="楼层名称"
                                />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-for="(item, i) in tableCloumn"
                        :key="item"
                        :label="item"
                        width="240"
                    >
                        <template #header>
                            <div class="table-item-header">
                                <span>{{ item }}</span>
                                <el-icon
                                    @click.stop="delCloumn(item)"
                                    class="del-cloumn-icon"
                                    ><CloseBold
                                /></el-icon>
                            </div>
                        </template>
                        <template #default="scope">
                            <div class="table-item-scope">
                                <CommInput
                                    v-model="tableData[scope.$index][item]"
                                    placeholder="请输入"
                                />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </CommPanel>
        <DetailInfo
            @close="infoShow = false"
            v-if="infoShow"
            :data="infoData"
        ></DetailInfo>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, Ref } from "vue";
import { CloseBold } from "@element-plus/icons-vue";
import useHouseholdStore from "@/store/householdStore";
import flickAppearance from "./lib/flickerAppearance";
import DetailInfo from "./DetailInfo.vue";
import { ClassificationPrimitive, ScreenSpaceEventHandler } from "cesium";
import uuid from "@/utils/uuid";

const householdStore = useHouseholdStore();
const newCloumn = ref("");
const householdName = ref("");
const infoShow = ref(false);
const infoData: Ref<Record<string, string>[] | undefined> = ref(undefined);
let blingPrimitive: ClassificationPrimitive | undefined;
let interval: number | undefined;
let handler: ScreenSpaceEventHandler | undefined;

const tableCloumn = computed(() => {
    return householdStore.getTableTitle;
});

const tableData = computed(() => {
    return householdStore.getTableData;
});

function addCloumn() {
    if (newCloumn.value) {
        householdStore.addTableTitle(newCloumn.value);
    }
}

function exportData() {
    let data = householdStore.exportData(householdName.value);
    let eleLink = document.createElement("a");
    eleLink.download = "data.json";
    eleLink.style.display = "none";
    let blob = new Blob([JSON.stringify(data, undefined, 4)], {
        type: "text/json",
    });
    eleLink.href = URL.createObjectURL(blob);
    eleLink.click();
}

function exportGeoJson() {
    let data = householdStore.exportToJson(householdName.value);
    let eleLink = document.createElement("a");
    eleLink.download = "data.json";
    eleLink.style.display = "none";
    let blob = new Blob([JSON.stringify(data, undefined, 4)], {
        type: "text/json",
    });
    eleLink.href = URL.createObjectURL(blob);
    eleLink.click();
}

function delCloumn(cloumn: string) {
    if (cloumn) {
        householdStore.delTableTitle(cloumn);
    }
}

function clickHandler() {
    if (handler) {
        handler && !handler.isDestroyed() && handler.destroy();
        handler = undefined;
    } else {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction((event: any) => {
            let pick = viewer.scene.pick(event.position);
            if (pick && pick.id && typeof pick.id === "string") {
                highLightPrimitive(pick.id);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}

function highLightPrimitive(uid: string) {
    clearHighLight();
    let geom = householdStore.findPrimitive(uid);
    if (geom) {
        let info = householdStore.getInfo(uid);
        info.unshift({
            label: "默认名称",
            value: householdName.value,
        });
        infoData.value = info;
        nextTick(() => {
            infoShow.value = true;
        });
        let alpha = 0.0;
        let id = uuid();
        let g = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(geom.cartesian3S),
            height: geom.height,
            extrudedHeight: geom.extrudedHeight,
        });
        let instance = new Cesium.GeometryInstance({
            id: id,
            geometry: g,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.RED.withAlpha(alpha)
                ),
            },
        });
        blingPrimitive = viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: instance,
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            })
        );
        interval = setInterval(() => {
            if (alpha >= 0.9) {
                alpha = 0.0;
            } else {
                alpha += 0.05;
            }
            let attr = blingPrimitive?.getGeometryInstanceAttributes(id);
            attr.color = Cesium.ColorGeometryInstanceAttribute.toValue(
                Cesium.Color.RED.withAlpha(alpha)
            );
        }, 20);
    }
}

function clearHighLight() {
    if (blingPrimitive) {
        infoShow.value = false;
        clearInterval(interval);
        viewer.scene.primitives.remove(blingPrimitive);
        blingPrimitive = undefined;
    }
}

onMounted(() => {
    clickHandler();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/SetAttribute.scss";
</style>
