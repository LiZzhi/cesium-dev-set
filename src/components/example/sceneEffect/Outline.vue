<template>
    <CommPanel title="轮廓" class="scene-panel-box">
        <div class="scene-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

const outLine = Cesium.PostProcessStageLibrary.createSilhouetteStage();

onMounted(() => {
    viewer.scene.postProcessStages.add(outLine);
    outLine.enabled = true;
    outLine.uniforms.color = Cesium.Color.YELLOW;
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});

const setVisible = (visible: boolean) => {
    outLine.enabled = visible;
}

</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
