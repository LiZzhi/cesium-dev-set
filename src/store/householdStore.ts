import { defineStore } from "pinia";
import deepClone from "@/utils/deepClone";

const useHouseholdStore = defineStore("household", {
    state: () => {
        return {
            tableTitle: new Set<string>(),
            dataMap: new Map<string, any>(),
        };
    },
    getters: {
        getTableTitle(state) {
            return [...state.tableTitle]
        },
        getTableData(state) {
            let data: Record<string, any>[] = [];
            state.dataMap.forEach((v) => {
                data.push(v.info);
            })
            return data;
        }
    },
    actions: {
        addTableTitle(title: string){
            let size = this.tableTitle.size;
            this.tableTitle.add(title);
            // 判断是否插入重复标题
            if (this.tableTitle.size > size) {
                this.dataMap.forEach((v) => {
                    v.info[title] = "";
                })
            }
        },
        delTableTitle(title: string){
            let isDel = this.tableTitle.delete(title);
            if (isDel) {
                this.dataMap.forEach((v) => {
                    Reflect.deleteProperty(v.info, title);
                })
            }
        },
        setDataMap(uid: string, data: Record<string, any>){
            this.dataMap.set(uid, data);
        },
        clearDataMap() {
            this.tableTitle.clear();
            this.dataMap.clear();
        },
        findPrimitive(uid: string){
            return deepClone(this.dataMap.get(uid)?.geom);
        },
        getInfo(uid: string){
            let info = deepClone(this.dataMap.get(uid)?.info);
            Reflect.deleteProperty(info, "uid");
            let infoArr: Record<string, string>[] = [];
            for (const key in info) {
                infoArr.push({
                    label: key,
                    value: info[key]
                })
            }
            return infoArr;
        },
        exportData(householdName: string){
            let data: Record<string, any>[] = [];
            this.dataMap.forEach((v, k) => {
                data.push({
                    uid: k,
                    geom: v.geom,
                    info: {
                        建筑名称: householdName,
                        ...v.info
                    }
                })
            })
            return data;
        }
    },
});

export default useHouseholdStore;
