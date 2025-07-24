<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import modelPointLightSource from "@/secdev/sceneEffect/light/modelPointLightSource";

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
            position: Cesium.Cartesian3.fromDegrees(115.98086471909922, 36.94953939415673, 10),
            lightColor: Cesium.Color.fromCssColorString("#6900ff"),
            lightRadius: 500,
        },
        {
            position: Cesium.Cartesian3.fromDegrees(116.0105956859757, 36.95041851576155, 20),
            lightColor: Cesium.Color.fromCssColorString("#FF4500"),
            lightRadius: 1000,
        },
    ];
    let option = modelPointLightSource(lightDataList);
    let tileset = new Cesium.Cesium3DTileset({
        url: window.$config.ip.BASE + "/data/baimo/tileset.json",
        maximumScreenSpaceError: 16,
    });
    tileset.customShader = new Cesium.CustomShader(option!);
    let tileset2 = new Cesium.Cesium3DTileset({
        url: window.$config.ip.BASE + "/data/baimo/tileset.json",
        maximumScreenSpaceError: 16,
        debugWireframe: true,
        enableDebugWireframe: true,
    });
    tileset2.customShader = new Cesium.CustomShader({
        mode: Cesium.CustomShaderMode.REPLACE_MATERIAL,
        lightingModel: Cesium.LightingModel.UNLIT,
        uniforms: {
            u_range: {
                type: Cesium.UniformType.FLOAT,
                value: -2236858.0329612587,
            },
            u_color: {
                type: Cesium.UniformType.VEC4,
                value: Cesium.Color.fromCssColorString('#62809b'),
            },
        },
        fragmentShaderText: `
            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                vec3 positionWC = fsInput.attributes.positionWC;
                if (positionWC.x >u_range&&positionWC.x<u_range+400.) {
                    material.diffuse = u_color.rgb;
                    material.alpha = 1.;
                } else {
                    discard;
                }
            }
        `,
    })
    let value = 20;
    viewer.scene.preRender.addEventListener((scene, time) => {
        // @ts-ignore
        if (tileset2.customShader.uniforms.u_range.value < -2239986.145233299) {
            value = 20;
            // @ts-ignore
        } else if (tileset2.customShader.uniforms.u_range.value > -2233222.2016934473) {
            value = -20;
        }
        // @ts-ignore
        tileset2.customShader.uniforms.u_range.value += value;
    });
    viewer.scene.primitives.add(tileset);
    viewer.scene.primitives.add(tileset2);
    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(
            -2240777.9391320753,
            4594060.114158817,
            3811372.81896419
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.274530686341806,
            -0.644445980232307,
            0.00006254913474190715
        ),
    });
});
</script>

<style lang="scss" scoped></style>
