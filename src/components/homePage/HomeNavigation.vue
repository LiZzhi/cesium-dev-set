<template>
    <el-menu default-active="0">
        <el-menu-item
            v-for="(item, index) in menuConfig"
            :key="item.name"
            :index="index + ''"
            @click="changeNav(item)"
        >
            <el-icon><IconMenu /></el-icon>
            <span>{{ item.label }}</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import { Menu as IconMenu } from "@element-plus/icons-vue";
import menuConfig from "@/config/menuConfig";
import useHomeStore from "@/store/homeStore";
import type { menuConfigType } from "@/type/config";

const homeStore = useHomeStore();

const changeNav = (item: menuConfigType) => {
    homeStore.checkMenu = item;
};
</script>

<style lang="scss" scoped>
@import "./assets/style/HomeNavigation.scss";
</style>
