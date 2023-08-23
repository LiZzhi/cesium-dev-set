<template>
    <div id="cesium-container"></div>
    <CommPanel
        title="路径漫游"
        :style="{
            width: '300px',
            left: '2%',
            top: '8%',
        }"
    >
        <div class="roam-panel">
            <el-radio-group v-model="roamingModel" size="small">
                <el-radio
                    v-for="(item, i) in modelList"
                    :key="item.value"
                    :label="item.value"
                    border
                    >{{ item.label }}</el-radio
                >
            </el-radio-group>
            <div class="height-input-box">
                <span class="height-label">离地高度：</span
                >
                <CommInput
                    class="height-input"
                    v-model="height"
                    placeholder="请输入离地高度"
                    :clearable="true"
                    :number="true"
                />
            </div>
            <div class="roam-btn-group">
                <div class="fir-row">
                    <CommButton @click="start(viewEnum.TPP, roamingModel)"
                        >开始(视角1)</CommButton
                    >
                    <CommButton @click="start(viewEnum.FPP, roamingModel)"
                        >开始(视角2)</CommButton
                    >
                </div>
                <div class="sec-row">
                    <CommButton @click="changeSpeed(1)">加速</CommButton>
                    <CommButton @click="changeSpeed(-1)">减速</CommButton>
                    <CommButton @click="stop">暂停</CommButton>
                    <CommButton @click="destroy">销毁</CommButton>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { initViewer } from "@/utils/earth";
import { Ref, ref, onMounted } from "vue";
import pathRoaming, {
    roamingEnum,
    viewEnum,
} from "@/secdev/cameraView/pathRoaming";
import fromDegreesToCartesian3Arr from "@/secdev/utils/fromDegreesToCartesian3Arr";

const ps = [
    new Cesium.Cartographic(
        119.44037341293323,
        35.34197106899855,
        5.872732096309598
    ),
    new Cesium.Cartographic(
        119.44252948098223,
        35.34223901339689,
        6.31711015359973
    ),
    new Cesium.Cartographic(
        119.4560550425358,
        35.34202148007459,
        22.906707659456394
    ),
    new Cesium.Cartographic(
        119.45610614546445,
        35.32762691608659,
        3.0852594116911622
    ),
];
const roamingModel: Ref<roamingEnum> = ref(2);
const modelList = ref([
    { label: "行人", value: roamingEnum.PEOPLE_ROAM },
    { label: "车辆", value: roamingEnum.CAR_ROAM },
    { label: "飞机", value: roamingEnum.UAV_ROAM },
]);

const height = ref(0);
const speed = ref(1);

let roam: pathRoaming;

const start = (view: viewEnum, type: roamingEnum) => {
    roam.destroy();
    roam.roamHeight = height.value;
    roam.startRoaming(ps, view, type);
};

const stop = () => {
    roam.stopRoaming();
};

const changeSpeed = (v: number) => {
    speed.value += v;
    if (speed.value < 1) {
        speed.value = 1;
    }
    roam.runSpeed = speed.value;
};

const destroy = () => {
    roam.destroy();
};

onMounted(() => {
    const viewer = initViewer("cesium-container");

    viewer.entities.add({
        polyline: {
            positions: fromDegreesToCartesian3Arr(ps),
            width: 4,
            clampToGround: true,
            arcType: Cesium.ArcType.RHUMB,
        },
    });

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            119.44252948098223,
            35.34223901339689,
            10000
        ),
    });

    roam = new pathRoaming(viewer);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/PathRoaming.scss";
</style>
