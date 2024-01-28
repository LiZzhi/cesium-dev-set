<template>
    <CommPanel title="全球水体" class="scene-panel-box">
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
import { GroundPrimitive } from "cesium";

let water: GroundPrimitive

onMounted(() => {
    const waterPrimitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
            }),
        })
        ,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: "Water",
                    uniforms: {
                        baseWaterColor: new Cesium.Color(0.117647, 0.564706, 1, 0.7),
                        specularMap: require("./assets/img/water/earthspec1k.jpg"),
                        normalMap: require("./assets/img/water/waterNormals.jpg"),
                        frequency: 10000.0,
                        animationSpeed: 0.01,
                        amplitude: 1.0,
                    },
                },
            }),
        }),
        classificationType: Cesium.ClassificationType.TERRAIN,
        show: true,
    });
    water = viewer.scene.primitives.add(waterPrimitive);
});

const setVisible = (visible: boolean) => {
    water.show = visible;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/SenenEffect.scss";
</style>
