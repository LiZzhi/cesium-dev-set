/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-26 14:46:22
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-26 17:03:19
 * @FilePath: \cesium-secdev-set\src\hooks\useDataTree.ts
 * @Description: 配合el-tree使用的数据树
 */

import { onBeforeUnmount, onMounted, reactive, ref, Ref } from "vue";
import { CustomDataSource, PrimitiveCollection } from "cesium";
import Node from "element-plus/es/components/tree/src/model/node";
import uuid from "@/utils/uuid";
import deepClone from "@/utils/deepClone";

// 源数据
export type originDataType = {
    label: string; // 名称
    itemType: "data" | "folder"; // 类型,数据或目录
    data?: any; // 数据,itemType为"data"时必须配置
    defaultCheck?: boolean; // (仅在数据上有效)是否默认勾选
    defaultExpand?: boolean; // (仅在目录上有效)是否默认展开
    singleChoice?: boolean; // (仅在数据上有效)是否单选,一定要同时配置singleSymbol,不然会产生未知错误
    singleSymbol?: string; // (仅在singleChoice为true时生效)单选组别,相同的singleSymbol视为同一组别,不可同时被勾选
    children?: originDataType[]; // 子树
};

// 清洗后数据
export type cleanDataType = originDataType & {
    pid: string;
    children: cleanDataType[];
    father?: cleanDataType;
};

export type treeCollectionType = {
    dataSource: CustomDataSource;
    primitives: PrimitiveCollection;
    others: Record<string, any>;
};

export type nodeType = Node;

export interface checkFunc {
    (
        item: cleanDataType,
        checked: boolean,
        collection: treeCollectionType
    ): void;
}

export interface clickFunc {
    (item: cleanDataType, node: Node, collection: treeCollectionType): void;
}

/**
 * @description: 数据树hooks
 * @param {*} data 数据配置
 * @param {*} checkCallback 勾选或取消勾选数据时触发的回调,接收三个参数:(当前项item,勾选状态node(boolean),数据存储集合collection(CustomDataSource))
 * @param {*} clickCallback 点击数据项时触发的回调,接收三个参数:(当前项item,节点状态node,数据存储集合collection(CustomDataSource))
 * @return {*}
 */
export default function useDataTree (
    data: originDataType[],
    checkCallback: checkFunc,
    clickCallback: clickFunc
) {
    // 创建数据集合
    let treeDataCollection: treeCollectionType = {
        dataSource: new Cesium.CustomDataSource(), // 当前树的dataSource数据集合,用来存放Entity,
        primitives: new Cesium.PrimitiveCollection(), // 当前树的primitive数据集合,用来存放primitive
        others: {}, // 当前树的其他类型数据集合,用来存放其他数据
    };

    let defaultExpandList = ref([]); // 默认展开的节点
    let defaultCheckList = ref([]); // 默认勾选的节点
    let singleChoiceList = reactive({}); // 单选节点
    let treeData = dataClean(
        data,
        defaultExpandList,
        defaultCheckList,
        singleChoiceList
    ); // 清洗数据
    const change = eventHandler(treeDataCollection, checkCallback); // 选中触发的事件
    const click = eventHandler(treeDataCollection, clickCallback); // 点击触发的事件

    onMounted(() => {
        initAddData(treeData, treeDataCollection, checkCallback); // 数据初始化
        viewer.dataSources.add(treeDataCollection.dataSource);
        viewer.scene.primitives.add(treeDataCollection.primitives);
    });

    onBeforeUnmount(() => {
        unmountData(treeData, treeDataCollection, checkCallback); // 数据卸载
        viewer.dataSources.remove(treeDataCollection.dataSource);
        viewer.scene.primitives.remove(treeDataCollection.primitives);
    });

    return {
        treeData, // el-tree绑定的数据
        defaultExpandList, // el-tree绑定的默认展开
        defaultCheckList, // el-tree绑定的默认勾选
        singleChoiceList, // 单选组
        change, // 勾选或取消勾选时触发
        click, // 点击选项时触发
    };
}

/**
 * @description: 清洗数据,设置唯一id和默认配置
 * @param {originDataType[]} originData
 * @param {Ref<string[]>} defaultExpandList 默认展开的节点
 * @param {Ref<string[]>} defaultCheckList 默认勾选的节点
 * @param {Record<string, string[]>} singleChoiceList 单选的节点
 * @param {cleanDataType} father 父级，回显使用
 * @return {cleanDataType[]}
 */
function dataClean(
    originData: originDataType[],
    defaultExpandList: Ref<string[]>,
    defaultCheckList: Ref<string[]>,
    singleChoiceList: Record<string, string[]>,
    father?: cleanDataType
): cleanDataType[] {
    let data = deepClone(originData); // 深拷贝
    data.forEach((item: cleanDataType) => {
        let pid = uuid();
        item.pid = pid;
        if (item.itemType === "folder" && item.defaultExpand) {
            // 添加默认展开
            defaultExpandList.value.push(pid);
        }
        if (item.itemType === "data" && item.defaultCheck) {
            // 添加默认勾选
            defaultCheckList.value.push(pid);
        }
        if (item.itemType === "data" && item.singleChoice) {
            // 配置单选组
            let symbolList = Reflect.get(singleChoiceList, item.singleSymbol!);
            if (symbolList) {
                symbolList.push(pid);
            } else {
                singleChoiceList[item.singleSymbol!] = [pid];
            }
        }
        if (father) {
            // 添加父级label方便回显或其他操作
            item.father = father;
        }
        if (item.itemType === "folder" && Array.isArray(item.children)) {
            // 递归清洗children
            dataClean(
                item.children,
                defaultExpandList,
                defaultCheckList,
                singleChoiceList,
                item
            );
        }
    });
    return data as cleanDataType[];
}

/**
 * @description: checkBox变化触发
 * @param {treeCollectionType} collection 数据集合
 * @param {clickFunc | checkFunc} callback 触发回调
 * @return {*}
 */
function eventHandler(
    collection: treeCollectionType,
    callback: clickFunc | checkFunc
) {
    typeof callback === "function" || (callback = () => {});
    return function (item: cleanDataType, node: Node & boolean) {
        if (item.itemType === "data") {
            callback(item, node, collection);
        }
    };
}

/**
 * @description: 数据初始化,由于初始的defaultCheck无法触发check-change事件,故单独做一次初始化
 * @param {cleanDataType[]} data
 * @param {treeCollectionType} collection
 * @param {checkFunc} callback
 * @return {*}
 */
function initAddData(
    data: cleanDataType[],
    collection: treeCollectionType,
    callback: checkFunc,
) {
    data.forEach((item) => {
        if (item.itemType === "folder" && Array.isArray(item.children)) {
            // 递归添加初始数据
            initAddData(item.children, collection, callback);
        }
        if (item.itemType === "data") {
            callback(item, !!item.defaultCheck, collection);
        }
    });
}

/**
 * @description: 数据卸载
 * @param {cleanDataType[]} data
 * @param {treeCollectionType} collection
 * @param {checkFunc} callback
 * @return {*}
 */
function unmountData(
    data: cleanDataType[],
    collection: treeCollectionType,
    callback: checkFunc
) {
    data.forEach((item) => {
        if (item.itemType === "folder" && Array.isArray(item.children)) {
            // 递归卸载数据
            unmountData(item.children, collection, callback);
        }
        if (item.itemType === "data") {
            // 卸载数据
            callback(item, false, collection);
        }
    });
}
