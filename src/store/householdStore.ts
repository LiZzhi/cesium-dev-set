import { defineStore } from "pinia";
import deepClone from "@/utils/deepClone";
import { Feature, Polygon } from "@turf/turf";

type geometryMapType = {
    coord: number[][][];
    uids: string[];
};

const useHouseholdStore = defineStore("household", {
    state: () => {
        return {
            tableTitle: new Set<string>(),
            dataMap: new Map<string, any>(),
            geometryMap: <geometryMapType[]>[],
        };
    },
    getters: {
        getTableTitle(state) {
            return [...state.tableTitle];
        },
        getTableData(state) {
            let data: Record<string, any>[] = [];
            state.dataMap.forEach((v) => {
                data.push(v.info);
            });
            return data;
        },
    },
    actions: {
        addTableTitle(title: string) {
            let size = this.tableTitle.size;
            this.tableTitle.add(title);
            // 判断是否插入重复标题
            if (this.tableTitle.size > size) {
                this.dataMap.forEach((v) => {
                    v.info[title] = "";
                });
            }
        },
        delTableTitle(title: string) {
            let isDel = this.tableTitle.delete(title);
            if (isDel) {
                this.dataMap.forEach((v) => {
                    Reflect.deleteProperty(v.info, title);
                });
            }
        },
        setDataMap(uid: string, data: Record<string, any>) {
            this.dataMap.set(uid, data);
        },
        setGeometryMap(data: geometryMapType[]) {
            this.geometryMap = data;
        },
        clearDataMap() {
            this.tableTitle.clear();
            this.dataMap.clear();
            this.geometryMap = [];
        },
        findPrimitive(uid: string) {
            return deepClone(this.dataMap.get(uid)?.geom);
        },
        getInfo(uid: string) {
            let info = deepClone(this.dataMap.get(uid)?.info);
            Reflect.deleteProperty(info, "uid");
            let infoArr: Record<string, string>[] = [];
            for (const key in info) {
                infoArr.push({
                    label: key,
                    value: info[key],
                });
            }
            return infoArr;
        },
        exportData(householdName: string) {
            let data: Record<string, any>[] = [];
            this.dataMap.forEach((v, k) => {
                data.push({
                    uid: k,
                    geom: v.geom,
                    info: {
                        建筑名称: householdName,
                        ...v.info,
                    },
                });
            });
            return data;
        },
        exportToJson(householdName: string) {
            let polygonList: Feature<Polygon, Record<string, any>>[] = [];
            this.geometryMap.forEach((g) => {
                let attributes: Record<string, any> = {};
                g.uids.forEach((id) => {
                    let data = this.dataMap.get(id);
                    attributes[id] = {
                        height: data.geom.height,
                        extrudedHeight: data.geom.extrudedHeight,
                        info: {
                            建筑名称: householdName,
                            ...data.info,
                        },
                    };
                });
                let p = turf.polygon(g.coord, attributes);
                polygonList.push(p);
            });
            return turf.featureCollection(polygonList);
        },
    },
});

export default useHouseholdStore;
