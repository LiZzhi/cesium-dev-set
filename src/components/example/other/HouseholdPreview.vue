<template>
    <CommPanel title="分层分户预览" class="household-panel-box">
        <div class="add-data-panel">
            <div class="input-box">
                <span class="text-label">数据源：</span>
                <CommInput v-model="dataSource"></CommInput>
            </div>
            <div class="btn-box">
                <CommButton @click="addModel" class="add-data-btn"
                    >添加</CommButton
                >
                <CommButton
                    @click="remove"
                    class="add-data-btn"
                    contentClass="clear"
                    >移除</CommButton
                >
            </div>
            <div class="import-box">
                <span class="text-label">分成分户数据：</span>
                <el-upload
                    ref="uploadRef"
                    class="household-upload"
                    :limit="1"
                    :on-change="loadData"
                    :auto-upload="false"
                    >导入</el-upload
                >
                <CommButton @click="removePrimitive">移除</CommButton>
            </div>
        </div>
    </CommPanel>
    <CommPanel
        title="详细信息"
        class="detail-info-box"
        @close="infoShow = false"
        v-if="infoShow"
    >
        <el-scrollbar>
            <el-descriptions
                class="detail-table"
                border
                :column="1"
                v-if="infoData"
            >
                <el-descriptions-item
                    v-for="(item, i) in infoData"
                    :key="item.label"
                    :label="item.label"
                    label-class-name="detail-label"
                    >{{ item.value }}</el-descriptions-item
                >
            </el-descriptions>
        </el-scrollbar>
    </CommPanel>
</template>

<script setup lang="ts">
import {
    Cartesian3,
    Cesium3DTileset,
    ClassificationPrimitive,
    GeometryInstance,
    ScreenSpaceEventHandler,
} from "cesium";
import { Ref, ref, onMounted, nextTick } from "vue";
import { UploadFile, UploadFiles } from "element-plus";
import uuid from "@/utils/uuid";

type jsonDataType = {
    uid: string;
    geom: {
        cartesian3S: Cartesian3[];
        height: number;
        extrudedHeight: number;
    };
    info: Record<string, string>;
};

const dataSource = ref(
    "http://192.168.4.120:8310/tiltphoto/api/v1/layers/dataset/城阳建筑物-B3DM/tileset.json"
);
const infoShow = ref(false);
const infoData: Ref<Record<string, string>[] | undefined> = ref(undefined);
let model: Cesium3DTileset | undefined;
let jsonData: jsonDataType[] = [];
let classPrimitive: ClassificationPrimitive | undefined;
let handler: ScreenSpaceEventHandler | undefined;
let interval: number | undefined;
let blingPrimitive: ClassificationPrimitive | undefined;

function addModel() {
    if (model) {
        remove();
    }
    model = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            // maximumScreenSpaceError: 10,
            url: dataSource.value,
        })
    );
    // if (model) {
    //     model.readyPromise.then(() => {
    //         viewer.flyTo(model!);
    //     });
    // }
}

function remove() {
    viewer.scene.primitives.remove(model);
    model = undefined;
}

function loadData(uploadFile: UploadFile) {
    if (!uploadFile.raw) {
        return;
    }
    let reader = new FileReader();
    reader.readAsText(uploadFile.raw, "UTF-8");
    reader.onload = (e) => {
        let jsonText = e.target?.result;
        if (typeof jsonText === "string") {
            jsonData = JSON.parse(jsonText);
            addPrimitive();
            classPrimitive?.readyPromise.then((p) => {
                viewer.camera.flyToBoundingSphere(
                    // @ts-ignore
                    p._primitive._boundingSpheres[0]
                );
            });
        }
    };
}

function addPrimitive() {
    removePrimitive();
    let instanceList: GeometryInstance[] = [];
    jsonData.forEach((v) => {
        let geom = v.geom;
        let g = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(geom.cartesian3S),
            height: geom.height,
            extrudedHeight: geom.extrudedHeight,
        });
        let instance = new Cesium.GeometryInstance({
            geometry: g,
            id: v.uid,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.WHITE.withAlpha(0)
                ),
            },
        });
        instanceList.push(instance);
        classPrimitive = new Cesium.ClassificationPrimitive({
            geometryInstances: instanceList,
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        });
        viewer.scene.primitives.add(classPrimitive);
    });
}

function removePrimitive() {
    clearHighLight();
    viewer.scene.primitives.remove(classPrimitive);
    classPrimitive = undefined;
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
                let data = jsonData.find((v) => v.uid === pick.id);
                data && highLightPrimitive(data);
                console.log(data);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}

function highLightPrimitive(data: jsonDataType) {
    clearHighLight();
    let info = data.info;
    let geom = data.geom;
    let infoList: Record<string, string>[] = [];
    for (const key in info) {
        if (key !== "uid") {
            infoList.push({
                label: key,
                value: info[key],
            });
        }
    }
    infoData.value = infoList;
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

function clearHighLight() {
    if (blingPrimitive) {
        infoShow.value = false;
        clearInterval(interval);
        viewer.scene.primitives.remove(blingPrimitive);
        blingPrimitive = undefined;
    }
}

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    clickHandler();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/HouseholdPreview.scss";
</style>
