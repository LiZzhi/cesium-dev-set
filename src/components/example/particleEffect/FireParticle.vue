<template>
    <CommPanel title="火焰特效" class="fire-panel-box">
        <div class="fire-panel">
            <div class="slider-group">
                <div
                    class="slider-item"
                    v-for="(item, i) in menuList"
                    :key="item.label"
                >
                    <div class="slider-label-box">
                        <span class="slider-label">{{ item.label }}</span>
                    </div>
                    <div class="slider-box">
                        <el-slider
                            v-model="item.data"
                            :min="item.min"
                            :max="item.max"
                            :step="item.step"
                        />
                    </div>
                </div>
            </div>
            <div class="btn-group">
                <CommButton @click="fire.setVisible(true)">显示</CommButton>
                <CommButton @click="fire.setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import fireParticle from "@/secdev/particleEffect/particle/fireParticle";

let fire: fireParticle;

const startScale = ref(3);
const endScale = ref(1.5);
const maximumParticleLife = ref(1.8);
const minimumParticleLife = ref(1.5);
const maximumSpeed = ref(9);
const minimumSpeed = ref(7);
const particleSize = ref(2);
const emissionRate = ref(200);

const menuList = ref([
    { label: "粒子数量", data: startScale, min: 0, max: 1000, step: 1 },
    { label: "粒子大小", data: endScale, min: 0, max: 60, step: 1 },
    { label: "最大生命", data: maximumParticleLife, min: 0.1, max: 5.0, step: 0.1 },
    { label: "最小生命", data: minimumParticleLife, min: 0.1, max: 5.0, step: 0.1 },
    { label: "最大速度", data: maximumSpeed, min: 0, max: 30, step: 1 },
    { label: "最小速度", data: minimumSpeed, min: 0, max: 30, step: 1 },
    { label: "初始比例", data: particleSize, min: 0, max: 10, step: 0.5 },
    { label: "终止比例", data: emissionRate, min: 0, max: 10, step: 0.5 },
]);

watchEffect(() => {
    const style = {
        startScale: startScale.value,
        endScale: endScale.value,
        maximumParticleLife: maximumParticleLife.value,
        minimumParticleLife: minimumParticleLife.value,
        maximumSpeed: maximumSpeed.value,
        minimumSpeed: minimumSpeed.value,
        particleSize: particleSize.value,
        emissionRate: emissionRate.value,
    };
    if (fire) {
        fire.style = style;
    }
});

onMounted(() => {
    viewer.flyTo(
        viewer.entities.add({
            model: {
                uri: require("../../../secdev/assets/gltf/airplane.gltf"),
                minimumPixelSize: 64,
            },
            position: Cesium.Cartesian3.fromDegrees(
                -112.110693,
                36.0994841,
                1000.0
            ),
        })
    );
    fire = new fireParticle(
        viewer,
        Cesium.Cartesian3.fromDegrees(-112.110693, 36.0994841, 1001)
    );
    fire.init();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/FireParticle.scss";
</style>
