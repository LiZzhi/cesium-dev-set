<template>
    <div class="toolbar">
        <el-dropdown>
            <el-icon style="margin-right: 8px; margin-top: 1px"
                ><setting
            /></el-icon>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>View</el-dropdown-item>
                    <el-dropdown-item>Add</el-dropdown-item>
                    <el-dropdown-item>Delete</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <span>Tom</span>
    </div>
</template>

<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";
</script>

<style lang="scss" scoped>
@import "./assets/style/HomeHeader.scss"
</style>
