<template>
    <CommPanel title="烟雾特效" class="particle-panel-box">
        <div class="particle-panel">
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
                        <CommSlider
                            v-model="item.data"
                            :min="item.min"
                            :max="item.max"
                            :step="item.step"
                        >
                        </CommSlider>
                    </div>
                </div>
            </div>
            <div class="btn-group">
                <CommButton @click="smoke.setVisible(true)">显示</CommButton>
                <CommButton @click="smoke.setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import smokeParticle from "@/secdev/sceneEffect/particle/smokeParticle";

let smoke: smokeParticle;

const startScale = ref(1);
const endScale = ref(7);
const maximumParticleLife = ref(5);
const minimumParticleLife = ref(5);
const maximumSpeed = ref(9.5);
const minimumSpeed = ref(9);
const emissionRate = ref(40);
const gravity = ref(-0.55);
const heading = ref(180);
const pitch = ref(315);

const menuList = ref([
    { label: "粒子初始比例", data: startScale, min: 0, max: 10, step: 1 },
    { label: "粒子最终比例", data: endScale, min: 0, max: 60, step: 1 },
    { label: "粒子最大寿命", data: maximumParticleLife, min: 0.1, max: 5.0, step: 0.1 },
    { label: "粒子最小寿命", data: minimumParticleLife, min: 0.1, max: 5.0, step: 0.1 },
    { label: "粒子最大速度", data: maximumSpeed, min: 0, max: 30, step: 1 },
    { label: "粒子最小速度", data: minimumSpeed, min: 0, max: 30, step: 1 },
    { label: "承受重力大小", data: gravity, min: -20, max: 20, step: 0.5 },
    { label: "每秒发射粒子", data: emissionRate, min: 0, max: 100, step: 1 },
    { label: "发射航向角", data: heading, min: 0, max: 360, step: 1 },
    { label: "发射倾斜角", data: pitch, min: 0, max: 360, step: 1 },
]);

watchEffect(() => {
    const style = {
        startScale: startScale.value,
        endScale: endScale.value,
        maximumParticleLife: maximumParticleLife.value,
        minimumParticleLife: minimumParticleLife.value,
        maximumSpeed: maximumSpeed.value,
        minimumSpeed: minimumSpeed.value,
        emissionRate: emissionRate.value,
        gravity: gravity.value,
        heading: heading.value,
        pitch: pitch.value,
    };
    if (smoke) {
        smoke.style = style;
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
    smoke = new smokeParticle(
        viewer,
        Cesium.Cartesian3.fromDegrees(-112.110693, 36.0994841, 1001)
    );
    smoke.init();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/Particle.scss";
</style>
