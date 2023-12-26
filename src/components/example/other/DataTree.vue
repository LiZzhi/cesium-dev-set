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
import { ref } from "vue";
import useDataTree, {
    cleanDataType,
    nodeType,
    treeCollectionType,
} from "@/hooks/useDataTree";
import data from "./assets/json/dataTree";

const {
    treeData,
    defaultExpandList,
    defaultCheckList,
    singleChoiceList,
    change,
    click,
} = useDataTree(data, changeCheck, clickNode);
console.log(treeData);

const $dataTree = ref();

function changeCheck(
    item: cleanDataType,
    checked: boolean,
    collection: treeCollectionType
) {
    if (item.data.type === "geojson") {
        
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
