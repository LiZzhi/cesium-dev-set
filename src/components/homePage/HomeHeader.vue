<template>
    <div class="header-container">
        <div class="header-icon-box">
            <span class="header-icon">
                Cesium二次开发集合
            </span>
        </div>
        <div class="toolbar">
            <div
                v-for="(item, i) in headerMenu"
                :key="item.label"
                class="header-menu-item"
                @click="headerFunc(item.label)"
            >
                {{ item.label }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const headerMenu = ref([
    { label: "示例程序" },
    { label: "Cesium中文文档" },
    { label: "检测WebGL" },
]);

const headerFunc = (label: string) => {
    switch (label) {
        case "示例程序":
            window.open("/", "_blank")
            break;
        case "Cesium中文文档":
            window.open("http://cesium.xin/cesium/cn/Documentation1.95/index.html", "_blank")
            break;
        case "检测WebGL":
            window.open("https://get.webgl.org/", "_blank")
            break;
        default:
            break;
    }
}
</script>

<style lang="scss" scoped>
@import "./assets/style/HomeHeader.scss";
</style>
