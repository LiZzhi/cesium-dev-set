<template>
    <div class="position-box">
        <span class="position-box-label">经度：{{ lon }}</span>
        <span class="position-box-label">纬度：{{ lat }}</span>
    </div>
</template>

<script setup lang='ts'>
import { Ref, onBeforeUnmount, onMounted, ref } from "vue";
import { ScreenSpaceEventHandler } from "cesium";
import cartographicTool from "@/secdev/utils/cartographicTool";

const lon: Ref<"未知"|number> = ref("未知");
const lat: Ref<"未知"|number> = ref("未知");

let handler: ScreenSpaceEventHandler;
onMounted(()=>{
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any)=>{
        let cartesian = viewer.camera.pickEllipsoid(movement.endPosition);
        if (cartesian) {
            let degrees = cartographicTool.formCartesian3(cartesian, false);
            lon.value = degrees[0];
            lat.value = degrees[1];
        } else {
            lon.value = "未知";
            lat.value = "未知";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
})

onBeforeUnmount(()=>{
    handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler && handler.destroy();
})

</script>

<style lang='scss' scoped>
@import "./assets/style/PositionBox.scss"

</style>
