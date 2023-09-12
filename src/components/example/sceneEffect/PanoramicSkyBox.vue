<template>
    <CommPanel title="天空盒" class="scene-panel-box">
        <div class="scene-panel">
            <div>
                <el-select
                    v-model="far"
                    placeholder="Select"
                    size="small"
                    class="comm-select"
                    popper-class="comm-option"
                >
                    <el-option
                        v-for="(item, i) in farList"
                        :key="item"
                        :label="'远景天空盒' + item"
                        :value="item"
                    />
                </el-select>
                <select
                    v-model="near"
                >
                    <option
                        v-for="(item, i) in nearList"
                        :value="item"
                    >{{ '近景天空盒' + item }}</option>
                </select>
            </div>
            <div class="btn-group">
                <CommButton @click="changeView('far')">远景</CommButton>
                <CommButton @click="changeView('near')">近景</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import panoramicSkyBox from "@/secdev/sceneEffect/sky/panoramicSkyBox";
import { Cartesian3, HeadingPitchRoll } from "cesium";

const far = ref("02");
const near = ref("02");
const farList = ["01", "02", "03"];
const nearList = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"
];
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
        destination: new Cesium.Cartesian3(65223480.94141966, 7611725.097783383, 36690685.67755988),
        orientation: new Cesium.HeadingPitchRoll(0.007964576421628067, -1.496632048717383, 6.278770156514737),
    })
});

const changeView = (type: "far"|"near") => {
    let destination: Cartesian3;
    let orientation: HeadingPitchRoll;
    if (type === "far") {
        // destination = new Cesium.Cartesian3(-45802988.9566341, -41512897.1313383, 42860387.48041018);
        // orientation = new Cesium.HeadingPitchRoll(1.2536256744910776, -1.49857771791951, 0.03727351623405806);
        destination = new Cesium.Cartesian3(65223480.94141966, 7611725.097783383, 36690685.67755988);
        orientation = new Cesium.HeadingPitchRoll(0.007964576421628067, -1.496632048717383, 6.278770156514737);
    } else {
        destination = new Cesium.Cartesian3(-2895596.962457116, 4717490.945820842, 3158425.3777735666);
        orientation = new Cesium.HeadingPitchRoll(3.8736780571268605, -0.13964038346926966, 6.283183317671659);
    }
    viewer.scene.camera.flyTo({destination, orientation})
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
