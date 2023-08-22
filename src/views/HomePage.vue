<template>
    <div class="home-container">
        <el-container class="container-all">
            <el-header class="container-header">
                <HomeHeader></HomeHeader>
            </el-header>
            <el-container class="container-body">
                <router-view />
            </el-container>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import HomeHeader from "@/components/homePage/HomeHeader.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/style/HomePage.scss";
</style>
