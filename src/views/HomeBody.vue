<template>
    <el-aside class="container-body-side">
        <HomeNavigation></HomeNavigation>
    </el-aside>
    <el-main class="container-body-main">
        <HomeMain></HomeMain>
    </el-main>
</template>

<script setup lang="ts">
import HomeNavigation from "@/components/homePage/HomeNavigation.vue";
import HomeMain from "@/components/homePage/HomeMain.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/style/HomeBody.scss"
</style>
