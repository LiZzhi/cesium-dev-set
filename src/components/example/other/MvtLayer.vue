<template>
    <CommPanel
        v-loading.fullscreen.lock="loading"
        element-loading-text="查询数据中..."
        element-loading-background="rgba(122, 122, 122, 0.8)"
        title="MVT瓦片"
        class="model-panel-box"
    >
        <div class="model-panel">
            <CommButton @click="">显示</CommButton>
            <CommButton @click="" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MVTImageryProvider from "mvt-imagery-provider";

const loading = ref(false);

onMounted(() => {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    // https://github.com/hongfaqiu/MVTImageryProvider/tree/main
    MVTImageryProvider.fromUrl(
        "https://demotiles.maplibre.org/style.json"
    ).then((t) => {
        // @ts-ignore
        viewer.imageryLayers.addImageryProvider(t);

        handler.setInputAction((e: any) => {
            loading.value = true;
            let pickRay = viewer.camera.getPickRay(e.position);
            let featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(
                pickRay!,
                viewer.scene
            );

            if (featuresPromise) {
                featuresPromise.then((p) => {
                    let data;
                    p.forEach((v) => {
                        if (v.name === "countries") {
                            data = v.data;
                        }
                    });
                    loading.value = false;
                    alert(JSON.stringify(data) || "无数据");
                });
            } else {
                loading.value = false;
                alert("无数据");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });
});
</script>

<style lang="scss" scoped>
@import "./assets/style/VectorWhiteModel.scss";
</style>
