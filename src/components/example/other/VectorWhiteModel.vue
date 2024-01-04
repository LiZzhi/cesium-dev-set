<template>
    <CommPanel
        title="矢量拉伸白模"
        class="model-panel-box"
    >
        <div class="model-panel">
            <CommButton @click="model.show=true">显示</CommButton>
            <CommButton @click="model.show=false" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang='ts'>
import { onMounted } from "vue";
import { Primitive, Cartesian3, GeometryInstance } from "cesium";
import building from "./assets/json/building_HanJiang.json";

type coordHeightType = {
    coord: Cartesian3[],
    height: number,
}

let model: Primitive;
let features = building.features;
let c3Arr:coordHeightType[] = [];
features.forEach((f) => {
    let coords = f.geometry.coordinates.flat(2);
    c3Arr.push({coord: Cesium.Cartesian3.fromDegreesArray(coords), height: f.properties.height});
})
let instanceArr: GeometryInstance[] = [];
c3Arr.forEach((c) => {
    let geo = Cesium.PolygonGeometry.createGeometry(
        new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(c.coord),
            height: 0,
            extrudedHeight: c.height,
            arcType: Cesium.ArcType.RHUMB,
        })
    )
    let instance = new Cesium.GeometryInstance({
        geometry: geo!,
        // attributes: {
        //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(0.6)),
        // }
    })
    instanceArr.push(instance);
})

const shader = `
    czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        material.diffuse = vec3(0.8, 0.2, 0.1);
        material.specular = 3.0;
        material.shininess = 0.8;
        material.alpha = 0.6;
        return material;
    }
`
const appearance = new Cesium.MaterialAppearance({
    material: new Cesium.Material({
        fabric: {
            source: shader
        }
    }),
})
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    model = new Cesium.Primitive({
        geometryInstances: instanceArr,
        appearance : appearance,
        // appearance : new Cesium.PerInstanceColorAppearance(),
        asynchronous: false,
    });

    viewer.scene.primitives.add(model);
    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(-2269792.505899, 5023104.730678, 3226017.575864),
        orientation: new Cesium.HeadingPitchRoll(5.826516, -0.899979, 6.281096),
    })
});
</script>

<style lang='scss' scoped>
@import "./assets/style/VectorWhiteModel.scss";
</style>
