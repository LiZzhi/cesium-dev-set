<template>
    <CommPanel title="数据图层" class="tree-panel-box">
        <div class="tree-panel">
            <el-tree
                :data="treeData"
                show-checkbox
                node-key="pid"
                @node-click="click"
                @check-change="change"
                :render-after-expand="false"
                :default-expanded-keys="defaultExpandList"
                :default-checked-keys="defaultCheckList"
                :expand-on-click-node="false"
                :highlight-current="false"
                ref="$dataTree"
            />
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import useDataTree, {
    cleanDataType,
    nodeType,
    treeCollectionType,
} from "@/hooks/useDataTree";
import { ElTree } from "element-plus";
import cartographicTool from "@/secdev/utils/cartographicTool";
import hasTerrian from "@/secdev/utils/hasTerrian";
import data from "./assets/json/dataTree";

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.imageryLayers.removeAll();
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            124.170172,
            40.58217,
            296590
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.283185307179585,
            -1.5707803201523163,
            0
        ),
    });
});

const {
    treeData,
    defaultExpandList,
    defaultCheckList,
    singleChoiceList,
    change,
    click,
} = useDataTree(data, changeCheck, clickNode);

const $dataTree = ref<InstanceType<typeof ElTree> | undefined>();

function changeCheck(
    item: cleanDataType,
    checked: boolean,
    collection: treeCollectionType
) {
    if (item.data.type === "geojson") {
        let dataId = `geojson-${item.label}-${item.pid}`;
        let entities = collection.dataSource.entities;
        // 查询数据是否已存在
        let existData = entities.getById(dataId);
        if (existData) {
            // 若该数据已存在,则清除
            entities.remove(existData);
        }

        if (checked) {
            // 解析geojson,二维数组坐标[[经度, 纬度]]
            let cs = item.data.data.features[0].geometry.coordinates[0][0];
            let positions = cartographicTool.toCartesian3S(cs);
            // 区划Entity
            let e = new Cesium.Entity({
                id: dataId,
                polyline: {
                    positions: positions,
                    material: Cesium.Color.fromCssColorString("#58FDFE"),
                    arcType: Cesium.ArcType.RHUMB,
                    clampToGround: true,
                },
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(positions),
                    material:
                        Cesium.Color.fromCssColorString("#58FDFE").withAlpha(
                            0.1
                        ),
                    arcType: Cesium.ArcType.RHUMB,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
            });
            entities.add(e);
        }
    } else if (item.data.type === "terrain") {
        // 删除地形,地形只能加载一个,所以无需加入数据集合判断
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        if (checked) {
            // 获取单选组
            let symbolList = Reflect.get(singleChoiceList, item.singleSymbol!);
            // 其他单选组成员取消勾选
            if (Array.isArray(symbolList)) {
                symbolList.forEach((id) => {
                    if (id !== item.pid) {
                        $dataTree.value?.setChecked(id, false, false);
                    }
                });
            }
            // 添加当前地形
            viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
                url: item.data.url,
                requestVertexNormals: false,
            });
        }
    } else if (item.data.type === "layer") {
        let dataId = `baseLayer-${item.label}-${item.pid}`;
        // 先删除底图
        let layer = Reflect.get(collection.others, dataId);
        viewer.imageryLayers.remove(layer);
        Reflect.deleteProperty(collection.others, dataId);
        if (checked) {
            // 获取单选组
            let symbolList = Reflect.get(singleChoiceList, item.singleSymbol!);
            // 其他单选组成员取消勾选
            if (Array.isArray(symbolList)) {
                symbolList.forEach((id) => {
                    if (id !== item.pid) {
                        $dataTree.value?.setChecked(id, false, false);
                    }
                });
            }
            // 添加当前影像
            let layer = viewer.imageryLayers.addImageryProvider(
                new Cesium.WebMapTileServiceImageryProvider({
                    ...item.data.options,
                }),
                0
            );
            collection.others[dataId] = layer;
        }
    } else if (item.data.type === "anno") {
        let dataId = `anno-${item.label}-${item.pid}`;
        // 先删除底图
        let layer = Reflect.get(collection.others, dataId);
        viewer.imageryLayers.remove(layer);
        Reflect.deleteProperty(collection.others, dataId);
        if (checked) {
            // 获取单选组
            let symbolList = Reflect.get(singleChoiceList, item.singleSymbol!);
            // 其他单选组成员取消勾选
            if (Array.isArray(symbolList)) {
                symbolList.forEach((id) => {
                    if (id !== item.pid) {
                        $dataTree.value?.setChecked(id, false, false);
                    }
                });
            }
            // 添加当前影像
            let layer = viewer.imageryLayers.addImageryProvider(
                new Cesium.WebMapTileServiceImageryProvider({
                    ...item.data.options,
                }),
                1
            );
            collection.others[dataId] = layer;
        }
    }
}

function clickNode(
    item: cleanDataType,
    node: nodeType,
    collection: treeCollectionType
) {
    if (!node.checked) {
        // 没有勾选不触发
        return;
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/DataTree.scss";
</style>
