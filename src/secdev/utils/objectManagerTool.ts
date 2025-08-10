import { Entity, Viewer, Primitive, CustomDataSource, PrimitiveCollection } from "cesium";
import uuid from "@/utils/uuid";
import type { voidFuncType } from "@/type/common";

export type objectOptionType = {
    objId: string;
    objType: "Entity" | "Primitive";
    objGroup?: string;
}

export type objectType = Entity | Primitive;

export type objectManangeType = objectOptionType & {
    object: objectType | Entity.ConstructorOptions
}

export type groupType = {
    objects: Map<string, objectType>;
    dataSource: CustomDataSource;
    collection: PrimitiveCollection;
}

/**
 * 图层元素管理类
 * viewer   Viewer对象
 */
export default class ObjectManagerTool {
    viewer: Viewer | null;
    defaultGroup: string;
    _objects: Map<string, objectOptionType>;
    _groups: Map<string, groupType>;
    constructor(viewer: Viewer) {
        this.viewer = viewer;
        this._objects = new Map();
        this._groups = new Map();
        this.defaultGroup = "group-" + uuid()
    }

    /**
     * 新增元素
     * @param {*} option
     * @param object 元素对象,必传
     * @param objId 元素ID,必传且唯一
     * @param objGroup 元素分组，非必传
     * @param objType 元素类型,必传，包括以下几种类型：
     *                【Entity】               基本实体
     *                【Primitive】            Primitive对象
     */
    addObject(options: objectManangeType) {
        let { object, objType, objId, objGroup } = options;
        if (!objId || !objType || !object) {
            console.warn("请检查参数是否完整！");
            return false;
        }
        if (this._objects.has(objId)) {
            console.warn("已存在相同名称的元素【" + objId + "】");
            return;
        }
        if (!objGroup) {
            objGroup = this.defaultGroup;
        }
        this._objects.set(objId, { objType, objId, objGroup })
        // @ts-ignore
        object.name = objId;
        let { dataSource, collection, objects } = this.getOrCreateGroup(objGroup) as groupType;
        if (objType === "Entity") {
            let e = dataSource.entities.add(object);
            objects.set(objId, e);
        } else if (objType === "Primitive") {
            let p = collection.add(object);
            objects.set(objId, p);
        }
    }

    /**
     * @description: 向元素组中添加元素
     * @param {*} objGroup 元素组名称
     * @param {*} groups 元素组
     * @return {*}
     */
    addObjGroup(objGroup: string, groups: objectManangeType[], callback?: voidFuncType) {
        let { dataSource, collection, objects } = this.getOrCreateGroup(objGroup) as groupType;
        objGroup = objGroup || this.defaultGroup;
        groups = groups || [];
        for (let i = 0; i < groups.length; i++) {
            let element = groups[i];
            element.objGroup = objGroup;
            element.objId = element.objId || uuid();
            // @ts-ignore
            element.object.name = element.objId;
            let info = {
                objType: element.objType,
                objId: element.objId,
                objGroup: element.objGroup,
            }
            this._objects.set(element.objId, info);
            if (element.objType === "Entity") {
                let e = dataSource.entities.add(element.object);
                objects.set(element.objId, e);
            } else if (element.objType === "Primitive") {
                let p = collection.add(element.object);
                objects.set(element.objId, p);
            }
        }
        if (callback instanceof Function) {
            callback({ dataSource, collection, objects });
        }
    }

    /**
     * @description: 获取所有元素
     * @return {*}
     */
    getObjectLists() {
        return [...this._objects.values()];
    }

    /**
     * @description: 根据id获取元素info
     * @param {*} id
     * @return {*}
     */
    getObjectInfoById(id: string) {
        return this._objects.get(id);
    }

    /**
     * @description: 获取元素组
     * @param {*} objGroup 元素组名称
     * @return {*}
     */
    getObjectByGroup(objGroup: string) {
        if (objGroup) {
            let group = this._groups.get(objGroup);
            if (!group) {
                group = this.getOrCreateGroup(objGroup);
            }
            let data: objectOptionType[] = [];
            group?.objects.forEach((v, i) => {
                data.push(this._objects.get(i)!);
            })
            return data;
        } else {
            return [];
        }
    }

    /**
     * @description: 获取或创建元素组
     * @param {*} objGroup 元素组名称
     * @return {*}
     */
    getOrCreateGroup(objGroup: string) {
        if (this._groups.has(objGroup)) {
            return this._groups.get(objGroup);
        } else {
            let dataSource = new Cesium.CustomDataSource(objGroup);
            let collection = new Cesium.PrimitiveCollection();
            let objects = new Map();
            this.viewer!.dataSources.add(dataSource);
            this.viewer!.scene.primitives.add(collection)
            let data = { dataSource, collection, objects };
            this._groups.set(objGroup, data)
            return data;
        }
    }

    /**
     * @description: 通过ID获取元素
     * @param {*} objId 元素ID
     * @return {*}
     */
    getObjectById(objId: string) {
        if (!objId) {
            console.warn("请检查参数是否完整！");
            return;
        }
        const info = this._objects.get(objId);
        if (!info) {
            return undefined;
        }
        let group = this._groups.get(info.objGroup!);
        let object = group?.objects.get(objId);
        return object;
    }

    /**
     * @description: 通过id重组为一个新的元素组
     * @param {string} newObjGroup
     * @param {string} objIds
     * @return {*}
     */
    regroupObjectById(newObjGroup: string, objIds: string[]) {
        if (!newObjGroup || !objIds?.length) {
            console.warn("请检查参数是否完整！");
            return;
        }
        if (this._groups.has(newObjGroup)) {
            console.warn("元素组已存在！");
            return;
        }
        let group: objectManangeType[] = []
        objIds.forEach((id) => {
            let info = this.getObjectInfoById(id);
            if (info) {
                let obj = this.getObjectById(id);
                this.removeObjectById(id);
                group.push({
                    ...info,
                    object: obj!
                })
            }
        })
        this.addObjGroup(newObjGroup, group)
    }

    /**
     * 通过ID删除元素
     * @param objId 元素ID，必传
     */
    removeObjectById(objId: string) {
        if (!objId) {
            console.warn("请检查参数是否完整！");
            return;
        }
        const info = this._objects.get(objId);
        this._objects.delete(objId);
        if (!info) {
            return;
        }
        let { dataSource, collection, objects } = this._groups.get(info.objGroup!) as groupType;
        let object = objects?.get(objId);
        if (info.objType === "Entity") {
            // @ts-ignore
            dataSource.entities.remove(object);
        } else if (info.objType === "Primitive") {
            collection.remove(object);
        }
        objects.delete(objId);
    }

    /**
     * 通过Group删除元素
     * @param objGroup 元素分组
     */
    removeObjectsByGroup(objGroup: string) {
        let group = this._groups.get(objGroup);
        if (group) {
            this.viewer!.dataSources.remove(group.dataSource);
            this.viewer!.scene.primitives.remove(group.collection);
            group.objects.forEach((v, i) => {
                this._objects.delete(i);
            })
            this._groups.delete(objGroup);
        }
    }

    /**
     * 删除所有元素
     */
    removeAllObjects() {
        this._groups.forEach((v, i) => {
            this.viewer!.dataSources.remove(v.dataSource);
            this.viewer!.scene.primitives.remove(v.collection);
        })
        this._groups.clear();
        this._objects.clear();
    }

    /**
     * 设置元素显隐状态（假删除）
     * @param objId 元素ID
     * @param visible 显隐状态
     */
    setVisibleById(objId: string, visible: boolean) {
        const object = this.getObjectById(objId);
        if (!object) {
            console.warn("未找到【" + objId + "】");
            return;
        }
        object.show = visible;
        // @ts-ignore
        object.visible = visible;
    }

    /**
     * 通过Group隐藏元素（假删除）
     * @param objGroup 元素分组
     * @param visible 显隐状态
     */
    setVisibleByGroup(objGroup: string, visible: boolean) {
        let group = this._groups.get(objGroup);
        group?.objects.forEach((v, i) => {
            v.show = visible;
            // @ts-ignore
            v.visible = visible;
        });
    }

    /**
     * 隐藏所有元素（假删除）
     */
    setAllObjectsVisible(visible: boolean) {
        this._groups.forEach((v, i) => {
            v.objects.forEach((ele, idx) => {
                ele.show = visible;
                // @ts-ignore
                ele.visible = visible;
            });
        });
    }

    /**
     * @description: 销毁
     * @return {*}
     */
    destroy() {
        this._objects.clear();
        this._groups.clear();
        this.viewer = null;
    }
}
