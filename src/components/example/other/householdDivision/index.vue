<template>
    <div class="btn-group">
        <CommButton
            v-for="(item, i) in btnList"
            :key="item.label"
            @click="item.show = !item.show"
            contentClass="top-btn"
            >{{ item.label }}</CommButton
        >
    </div>
    <component
        v-for="(item, i) in btnList"
        :key="item.label"
        :is="item.com"
        v-show="item.show"
        @close="item.show = false"
    ></component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Add3DTileset from "./Add3DTileset.vue";
import HouseholdDivision from "./HouseholdDivision.vue";
import SetAttribute from "./SetAttribute.vue";

export default defineComponent({
    components: {
        Add3DTileset,
        HouseholdDivision,
        SetAttribute
    },
});
</script>

<script setup lang="ts">
import { Ref, ref, onMounted } from "vue";

type btnListType = {
    label: string;
    show: boolean;
    com: any;
};

const btnList: Ref<btnListType[]> = ref([
    { label: "添加3DTileset数据", show: true, com: "Add3DTileset" },
    { label: "楼层分户", show: false, com: "HouseholdDivision" },
    { label: "分配属性", show: false, com: "SetAttribute" },
]);

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/index.scss";
</style>
