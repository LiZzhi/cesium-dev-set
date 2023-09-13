<template>
    <CommPanel title="天空特效" class="sky-panel-box">
        <div class="sky-panel">
            <div class="select-group">
                <CommSelect
                    placeholder="请选择远景天空特效"
                    :data="farItemList"
                    :select="change('far')"
                ></CommSelect>
                <CommSelect
                    placeholder="请选择近景天空特效"
                    :data="nearItemList"
                    :select="change('near')"
                ></CommSelect>
            </div>
            <div class="btn-group">
                <CommButton @click="changeView('far')" class="btn">远景</CommButton>
                <CommButton @click="changeView('near')" class="btn">近景</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import panoramicSkyBox from "@/secdev/sceneEffect/sky/panoramicSkyBox";
import { Cartesian3, HeadingPitchRoll } from "cesium";
import { selectOptionType } from "@/type/common";

const far = ref("02");
const near = ref("02");
const farList = ["01", "02", "03"];
const nearList = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"
];
const farItemList = computed(()=>{
    let list:selectOptionType[] = [];
    farList.forEach(v=>{
        list.push({
            label: "远景天空特效" + v,
            value: v,
        })
    })
    return list;
})
const nearItemList = computed(()=>{
    let list:selectOptionType[] = [];
    nearList.forEach(v=>{
        list.push({
            label: "近景天空特效" + v,
            value: v,
        })
    })
    return list;
})

const change = (key: "near" | "far") => {
    return (value: selectOptionType) => {
        if (key === "near") {
            near.value = value.value;
        }
        if (key === "far") {
            far.value = value.value;
        }
    }
}

let sky: panoramicSkyBox;

watch(far, (v)=>{
    sky.farOptions = {
        sources: {
            positiveX : require(`./assets/img/skyBox/far/${v}/Right.jpg`),
            negativeX : require(`./assets/img/skyBox/far/${v}/Left.jpg`),
            positiveY : require(`./assets/img/skyBox/far/${v}/Front.jpg`),
            negativeY : require(`./assets/img/skyBox/far/${v}/Back.jpg`),
            positiveZ : require(`./assets/img/skyBox/far/${v}/Up.jpg`),
            negativeZ : require(`./assets/img/skyBox/far/${v}/Down.jpg`),
        }
    };
})

watch(near, (v)=>{
    sky.nearOptions = {
        sources: {
            positiveX : require(`./assets/img/skyBox/near/${v}/Right.jpg`),
            negativeX : require(`./assets/img/skyBox/near/${v}/Left.jpg`),
            positiveY : require(`./assets/img/skyBox/near/${v}/Front.jpg`),
            negativeY : require(`./assets/img/skyBox/near/${v}/Back.jpg`),
            positiveZ : require(`./assets/img/skyBox/near/${v}/Up.jpg`),
            negativeZ : require(`./assets/img/skyBox/near/${v}/Down.jpg`),
        }
    };
})
onMounted(() => {
    let nearOptions = {
        sources: {
            positiveX : require("./assets/img/skyBox/near/02/Right.jpg"),
            negativeX : require("./assets/img/skyBox/near/02/Left.jpg"),
            positiveY : require("./assets/img/skyBox/near/02/Front.jpg"),
            negativeY : require("./assets/img/skyBox/near/02/Back.jpg"),
            positiveZ : require("./assets/img/skyBox/near/02/Up.jpg"),
            negativeZ : require("./assets/img/skyBox/near/02/Down.jpg"),
        }
    };
    let farOptions = {
        sources: {
            positiveX : require("./assets/img/skyBox/far/02/Right.jpg"),
            negativeX : require("./assets/img/skyBox/far/02/Left.jpg"),
            positiveY : require("./assets/img/skyBox/far/02/Front.jpg"),
            negativeY : require("./assets/img/skyBox/far/02/Back.jpg"),
            positiveZ : require("./assets/img/skyBox/far/02/Up.jpg"),
            negativeZ : require("./assets/img/skyBox/far/02/Down.jpg"),
        }
    };
    sky = new panoramicSkyBox(viewer, farOptions, nearOptions);
    sky.init();
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.camera.flyTo({
        destination: new Cesium.Cartesian3(37382457.79237426, -53766399.1478696, 37013151.88743977),
        orientation: new Cesium.HeadingPitchRoll(0.004531006974906937, -1.4966148618698796, 6.278633154536658),
    })
});

const changeView = (type: "far"|"near") => {
    let destination: Cartesian3;
    let orientation: HeadingPitchRoll;
    if (type === "far") {
        // destination = new Cesium.Cartesian3(-45802988.9566341, -41512897.1313383, 42860387.48041018);
        // orientation = new Cesium.HeadingPitchRoll(1.2536256744910776, -1.49857771791951, 0.03727351623405806);
        destination = new Cesium.Cartesian3(37382457.79237426, -53766399.1478696, 37013151.88743977);
        orientation = new Cesium.HeadingPitchRoll(0.004531006974906937, -1.4966148618698796, 6.278633154536658);
    } else {
        destination = new Cesium.Cartesian3(-2895596.962457116, 4717490.945820842, 3158425.3777735666);
        orientation = new Cesium.HeadingPitchRoll(3.8736780571268605, -0.13964038346926966, 6.283183317671659);
    }
    viewer.scene.camera.flyTo({destination, orientation})
}
</script>

<style lang="scss" scoped>
@import "./assets/style/PanoramicSkyBox.scss";
</style>
