<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import entityFactory from "@/secdev/utils/entityFactory";
import cartographicTool from "@/secdev/utils/cartographicTool";
import rectJson from "./assets/json/rect.json";

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            // maximumScreenSpaceError: 10,
            url: new Cesium.Resource({
                url: "tileset/trees/tileset.json",
            })
        })
    );

    let positions = cartographicTool.toCartesian3S(rectJson.features[0].geometry.coordinates[0][0]);
    let e = entityFactory.createPolyline(positions);
    viewer.entities.add(e);
    viewer.flyTo(e);
})
</script>

<style lang="scss" scoped></style>
