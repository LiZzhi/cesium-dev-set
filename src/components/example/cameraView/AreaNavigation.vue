<template>
    <CommPanel title="地区导航" class="navigation-panel-box">
        <div class="navigation-panel">
            <div class="navigation-title">
                <div class="navigation-title-box">
                    <span class="navigation-title-label">地区：{{ name }}</span>
                    <div
                        class="navigation-back-triangle"
                        v-if="level !== levelEnum.PROVINCE"
                        @click="back"
                    ></div>
                </div>
                <el-divider class="navigation-divider" />
            </div>
            <div
                class="navigation-province"
                v-if="level === levelEnum.PROVINCE"
            >
                <div
                    v-for="(region, index) in province"
                    :key="region.name"
                    class="province-container"
                >
                    <div class="province-region">{{ region.name }}</div>
                    <div class="province-item-body">
                        <span
                            v-for="(p, i) in region.cityList"
                            :key="p.adcode"
                            class="province-item"
                            @click="flyToBoundary(p.adcode)"
                        >
                            {{ p.name }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="navigation-subdomain" v-else>
                <span
                    v-for="(sub, i) in subdomainList"
                    :key="sub.adcode"
                    class="subdomain-item"
                    @click="flyToBoundary(sub.adcode)"
                >
                    {{ sub.name }}
                </span>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import province from "./assets/json/province.json";
import server from "@/server";
import api from "@/server/aLiYun/api";

const http = server.aLiYunServer;

type subdomainType = {
    name: string;
    adcode: number;
};
const subdomainList: Ref<subdomainType[]> = ref([]);

enum levelEnum {
    PROVINCE = 1,
    CITY = 2,
    COUNTY = 3,
}
const level: Ref<levelEnum> = ref(levelEnum.PROVINCE);

const name = ref("全国");
const back = () => {
    subdomainList.value.length = 0;
    viewer.dataSources.removeAll();
    level.value = levelEnum.PROVINCE;
    name.value = "全国";
};

const flyToBoundary = async (adcode: number) => {
    const boundaryJson = await http.get(api.boundary, {
        params: {
            code: adcode,
        },
    });
    if (boundaryJson.status === 200) {
        let boundaryData = boundaryJson.data;
        // 更换名称
        name.value = boundaryData.features[0].properties.name;
        // 加载边界
        addData(boundaryData);
        // 查询子区域
        getSubdomain(adcode);
    } else {
        return;
    }
};

const getSubdomain = (adcode: number) => {
    http.get(api.boundary, {
        params: {
            code: adcode + "_full",
        },
    })
        .then((json) => {
            let subdomainData = json.data;
            // 更换辖下区域
            subdomainList.value.length = 0;
            if (subdomainData.type === "FeatureCollection") {
                subdomainData.features.forEach((feature: any) => {
                    subdomainList.value.push({
                        name: feature.properties.name,
                        adcode: feature.properties.adcode,
                    });
                });
            }
            // 切换等级
            level.value += 1;
        })
        .catch((err) => {});
};

const addData = async (json: any) => {
    viewer.dataSources.removeAll();
    const dataSource = await Cesium.GeoJsonDataSource.load(json, {
        clampToGround: true,
    });
    viewer.dataSources.add(dataSource);
    viewer.flyTo(dataSource);
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
@import "./assets/style/AreaNavigation.scss";
</style>
