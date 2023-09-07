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
                <CommButton @click="fountain.setVisible(true)">显示</CommButton>
                <CommButton @click="fountain.setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import fountainParticle from "@/secdev/sceneEffect/particle/fountainParticle";
import fireParticle from "@/secdev/sceneEffect/particle/fireParticle";

let fountain: fountainParticle;

const startScale = ref(5);
const endScale = ref(30);
const maximumParticleLife = ref(10);
const minimumParticleLife = ref(5);
const maximumSpeed = ref(30);
const minimumSpeed = ref(20);
const emissionRate = ref(40);
const gravity = ref(-5.0);
const heading = ref(100.0);
const pitch = ref(20.0);

const menuList = ref([
    { label: "粒子初始比例", data: startScale, min: 0, max: 10, step: 1 },
    { label: "粒子最终比例", data: endScale, min: 0, max: 60, step: 1 },
    { label: "粒子最大寿命", data: maximumParticleLife, min: 0.1, max: 20.0, step: 0.1 },
    { label: "粒子最小寿命", data: minimumParticleLife, min: 0.1, max: 20.0, step: 0.1 },
    { label: "粒子最大速度", data: maximumSpeed, min: 0, max: 50, step: 1 },
    { label: "粒子最小速度", data: minimumSpeed, min: 0, max: 50, step: 1 },
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
    if (fountain) {
        fountain.style = style;
    }
});

onMounted(() => {
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
    viewer.entities.add({
        model: {
            uri: require("../../../secdev/assets/gltf/xfc.glb"),
            scale: 2
        },
        position: new Cesium.Cartesian3(-1715457.973647613, 4993562.065931494, 3566762.323781855),
    })
    const fire1 = new fireParticle(
        viewer,
        new Cesium.Cartesian3(-1715460.6128101698, 4993542.040011003, 3566814.6695078486)
    );
    const fire2 = new fireParticle(
        viewer,
        new Cesium.Cartesian3(-1715457.8327030898, 4993525.3887752695, 3566843.510620191)
    );
    fountain = new fountainParticle(
        viewer,
        new Cesium.Cartesian3(-1715457.973647613, 4993562.065931494, 3566762.323781855),
        {
            startScale: 5,
            endScale: 30,
            gravity: -5,
            minimumParticleLife: 5,
            maximumParticleLife: 10,
            minimumSpeed: 20,
            maximumSpeed: 30,
            heading: 100.0,
            pitch: 20.0,
        }
    );
    fire1.init();
    fire2.init();
    fountain.init();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/Particle.scss";
</style>
