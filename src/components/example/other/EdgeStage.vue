<template>
    <CommPanel title="3D描边" class="edge-panel-box">
        <div class="edge-panel">
            <div>点击模型描边</div>
            <CommButton @click="clear">清空</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import edgeStage from "@/secdev/other/edgeStage";

let outlineStage: edgeStage;
let select: any[] = [];

onMounted(() => {
    outlineStage = new edgeStage(viewer, "outlineEffect", {
        visibleEdgeColor: Cesium.Color.fromCssColorString("#a8a8e0"),
        hiddenEdgeColor: Cesium.Color.fromCssColorString("#4d4d4d"),
        outlineWidth: 1,
    });
    outlineStage.init();
    eventHandler();
    add();
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            1336559.8844981797,
            -4655709.268743104,
            4136708.73351429
        ),
        orientation: new Cesium.HeadingPitchRoll(
            0.34905645800491314,
            -0.5877090291180265,
            0.000017889194398712505
        ),
    });
});

function eventHandler() {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction((e: any) => {
        var mousePosition = e.position;
        var picked = viewer.scene.pick(mousePosition);

        if (picked && picked.primitive) {
            let primitive = picked.primitive;
            let pickIds = primitive._pickIds;
            let pickId = picked.pickId;

            if (!pickId && !pickIds && picked.content) {
                pickIds = picked.content._model._pickIds;
            }

            if (!pickId) {
                if (picked.id) {
                    pickId = pickIds.find((pickId: any) => {
                        return pickId.object == picked;
                    });
                } else if (pickIds) {
                    pickId = pickIds[0];
                }
            }

            if (pickId) {
                console.log(picked);
                console.log(pickId);
                let index = select.findIndex((v) => v === pickId);
                if (index !== -1) {
                    select.splice(index, 1);
                } else {
                    select.push(pickId);
                }
                outlineStage.clearSelect();
                outlineStage.changeSelect(select);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function clear() {
    select = [];
    outlineStage.clearSelect();
}

function add() {
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-73.979289, 40.699, 50),
        box: {
            dimensions: new Cesium.Cartesian3(100, 100, 100),
            material: Cesium.Color.GREY,
        },
    });
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-73.9752801, 40.6977969, 50),
        ellipsoid: {
            radii: new Cesium.Cartesian3(50, 50, 50),
            material: Cesium.Color.GREY,
        },
    });
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-73.975964, 40.700657, 0),
        model: {
            uri: require("./assets/gltf/CesiumMilkTruck.glb"),
            scale: 50,
            runAnimations: true,
        },
    });
    viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: Cesium.IonResource.fromAssetId(75343),
        })
    );
}
</script>

<style lang="scss" scoped>
@import "./assets/style/EdgeStage.scss";
</style>
