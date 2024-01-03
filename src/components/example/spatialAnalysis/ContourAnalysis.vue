<template>
    <CommPanel title="等高线分析" class="contour-panel-box">
        <div class="contour-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(true)">显示</CommButton>
                <CommButton @click="setVisible(false)" contentClass="clear">隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
    setVisible(true);
});

const setVisible = (visible: boolean) => {
    if (visible) {
        viewer.scene.globe.material = getCountorMaterial();
    } else {
        // @ts-ignore
        viewer.scene.globe.material = undefined;
    }
}

const getCountorMaterial = () => {
	let material = Cesium.Material.fromType('ElevationContour');
	let contourUniforms = material.uniforms;
	contourUniforms.width = 2;
	contourUniforms.spacing = 150;
	contourUniforms.color = Cesium.Color.RED;
	return material;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ContourAnalysis.scss";
</style>
