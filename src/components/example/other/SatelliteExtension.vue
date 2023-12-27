<template>
    <CommPanel
        title="卫星推演"
        class="clip-panel-box"
    >
        <div class="clip-panel">
            <CommButton @click="add">添加</CommButton>
            <CommButton @click="remove" contentClass="clear">移除</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import satelliteManager from "@/secdev/other/satellite/satelliteManager";
import satelliteComponents from "@/secdev/other/satellite/satelliteComponents";

let satMana: satelliteManager;
const file = require("./assets/file/public.txt");

onMounted(() => {
    viewer.clock.shouldAnimate = true;
    // viewer.clock.multiplier = 100;

    satMana = new satelliteManager(viewer);
    add();
});

const add = ()=>{
    fetch(file, {
            mode: 'no-cors',
        })
            .then(response => response.text())
            .then(data => {
                const lines = data.split(/\r?\n/);
                for (let i = 2; i < lines.length; i + 3) {

                    let tle = lines.splice(i - 2, i + 1).join('\n');
                    let sat = satMana.addFromTle(tle);

                    if (!["FY-2E", "FY-2H", "FY-2G", "FY-4A", "FY-2F", "GF-4"].includes(sat.props.name)) {
                        sat.enableComponent(satelliteComponents.Point);
                        sat.enableComponent(satelliteComponents.SatImage);
                        sat.enableComponent(satelliteComponents.Label);
                        sat.enableComponent(satelliteComponents.Orbit);
                        sat.enableComponent(satelliteComponents.SensorCone);
                    }
                }
            })
            .catch(function(error) {
                console.log(error);
            });
}

const remove = ()=>{
    satMana.removeAll();
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SatelliteExtension.scss";
</style>
