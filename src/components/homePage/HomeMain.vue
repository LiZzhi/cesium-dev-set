<template>
    <el-scrollbar>
        <el-row class="main-row" :gutter="40">
            <el-col
                class="main-col"
                :span="6"
                v-for="(item, index) in homeStore.checkMenu.components"
                :key="item.label"
            >
                <MenuPanel :name="item.label" :img="item.img" @click="openNewPage(item.route)"></MenuPanel>
            </el-col>
        </el-row>
    </el-scrollbar>
</template>

<script setup lang="ts">
import MenuPanel from "@/components/common/MenuPanel.vue";
import useHomeStore from "@/store/homeStore";
import { useRouter } from "vue-router";

const router = useRouter();
const homeStore = useHomeStore();

const openNewPage = (name: string) => {
    const page = router.resolve({ name });
    window.open(page.href, "_blank");
};
</script>

<style lang="scss" scoped>
@import "./assets/style/HomeMain.scss";
</style>
