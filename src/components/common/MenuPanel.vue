<template>
    <div class="menu-panel">
        <el-container class="panel-container">
            <el-main class="panel-main">
                <img class="cover-img" :src="props.img" alt="" />
            </el-main>
            <el-footer class="panel-fotter">
                <div class="caption">
                    <el-icon><Star /></el-icon>
                    <span class="caption-label"> {{ props.name }}</span>
                </div>
            </el-footer>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { voidFuncType } from "../../type/common";
import { Star } from "@element-plus/icons-vue";


const props = defineProps({
    name: {
        type: String,
        required: false,
        default: "默认名称",
    },
    img: {
        type: String,
        required: false,
        default: require("@/assets/specialEffectPlot/test.jpg"),
    }
});
</script>

<style lang="scss" scoped>
@import "./assets/style/MenuPanel.scss";
</style>
