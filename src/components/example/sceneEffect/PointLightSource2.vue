<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import pointLightSource from "@/secdev/sceneEffect/light/pointLightSource";

onMounted(() => {
    // 启用实验性模型，不启用customShader不生效
    Cesium.ExperimentalFeatures.enableModelExperimental = true;
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
        new Cesium.ArcGisMapServerImageryProvider({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
        })
    );
    let lightDataList = [
        {
            position: Cesium.Cartesian3.fromDegrees(115.98230411157061, 36.970072945285665, 10),
            lightColor: Cesium.Color.fromCssColorString("#6900ff"),
            lightRadius: 500,
        },
        {
            position: Cesium.Cartesian3.fromDegrees(115.99812059770608, 36.96477127849801, 20),
            lightColor: Cesium.Color.fromCssColorString("#FF4500"),
            lightRadius: 1000,
        },
        {
            position: Cesium.Cartesian3.fromDegrees(115.99374427056338, 36.97565462321896, 15),
            lightColor: new Cesium.Color(0.0, 3.0, 0.0),
            lightRadius: 600,
        },
    ];
    let option = pointLightSource(lightDataList, {
        baseColor: new Cesium.Color(0.0, 0.1, 0.3),
        useLight: false,
    });
    let tileset = new Cesium.Cesium3DTileset({
        url: window.$config.ip.BASE + "/data/baimo/tileset.json",
        maximumScreenSpaceError: 16,
        shadows: Cesium.ShadowMode.DISABLED,
    });
    tileset.customShader = new Cesium.CustomShader(option!);
    viewer.scene.primitives.add(tileset);
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            -2233677.156967121,
            4587942.164398858,
            3819778.5191376465
        ),
        orientation: new Cesium.HeadingPitchRoll(
            2.4589835338048673,
            -0.6854758798391005,
            0.000119326829040034
        )
    });
});
</script>

<style lang="scss" scoped></style>
