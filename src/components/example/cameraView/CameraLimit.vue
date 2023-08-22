<template>
    <div id="cesium-container"></div>
    <CommPanel
        title="视角限制"
        :style="{
            left: '5%',
        }"
    >
        <div class="limit-panel">
            <el-button @click="setLimit(false)">限制视角1(慢回滚)</el-button>
            <el-button @click="setLimit(true)">限制视角2(即时回滚)</el-button>
            <el-button @click="removeLimit">关闭限制</el-button>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { onMounted } from "vue";
import cameraLimit from "@/secdev/cameraView/cameraLimit";

let limit: cameraLimit;

const setLimit = (value: boolean) => {
    limit.removeLimit();
    limit.setLimit(value);
};

const removeLimit = () => {
    limit.removeLimit();
}

onMounted(() => {
    const viewer = initViewer("cesium-container");
    // 开启深度监测
    viewer.scene.globe.depthTestAgainstTerrain = true;

    limit = new cameraLimit(viewer, {
        position: Cesium.Cartesian3.fromDegrees(
            118.42533733304246,
            40.722983346052956,
            10000
        ),
        radius: 100000,
        debugExtent: true,
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/CameraLimit.scss";
</style>
