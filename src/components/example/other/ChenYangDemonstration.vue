<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import splitLine from "@/secdev/utils/splitLine";
import cartographicTool from "@/secdev/utils/cartographicTool";
import polylineTrailImageMaterial from "@/secdev/specialEffectPlot/lineMaterial/PolylineTrailImageMaterial.js";
import diffusedAppearance from "@/secdev/specialEffectPlot/polygon/diffusedAppearance";
import line1Json from "./assets/json/line1.json";
import line2Json from "./assets/json/line2.json";
import pointJson from "./assets/json/point.json";
import areaJson from "./assets/json/area.json";
import streetJson from "./assets/json/street.json";

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.imageryLayers.removeAll();
    viewer.scene.skyAtmosphere.show = false; // 大气层显示
    viewer.scene.moon.show = false; // 月亮
    viewer.scene.skyAtmosphere.show = false; // 大气
    viewer.scene.fog.enabled = false; // 雾
    viewer.scene.globe.showGroundAtmosphere = false; // 地面大气效果
    viewer.scene.skyBox.show = false; // 天空盒
    viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
    viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0); //修改地球体背景透明
    let exampleDom = document.querySelector(".example-body") as HTMLDivElement;
    exampleDom.style.backgroundImage = `url(${require("./assets/img/screen_bg2.png")})`;
    exampleDom.style.backgroundSize = "100% 100%";

    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            -2624718.6156857125,
            4481528.178505735,
            3751068.273845354
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.213372060719744,
            -0.9450965791841455,
            9.423201863256736e-8
        ),
    });

    // 加载图层
    addLabels();
    addLines();
    addScan();
    addArea();
    addStreet();
});

function addLabels() {
    line1Json.features.forEach((item) => {
        let positions = cartographicTool.toCartesian3S(
            item.geometry.coordinates[0]
        );
        let labelCount = item.properties.name.length;
        let split = 10 + labelCount;
        let ps = splitLine.byChunk(positions, split);
        let nowLabelCount = 0;
        for (let i = 0; i < ps.length; i++) {
            if (i >= split / 2 - labelCount / 2 && nowLabelCount < labelCount) {
                viewer.entities.add({
                    position: ps[i],
                    label: {
                        text: item.properties.name[nowLabelCount],
                        font: "20px 黑体",
                        verticalOrigin: 0,
                        fillColor:
                            item.properties.name === "胶州湾生态魅力带"
                                ? Cesium.Color.BLUE
                                : Cesium.Color.fromCssColorString(
                                      "rgba(203,58,19,1)"
                                  ),
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 4,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        eyeOffset: new Cesium.Cartesian3(0, 0, -1000),
                    },
                });
                nowLabelCount++;
            }
        }
    });
}

function addLines() {
    line2Json.features.forEach((v, i) => {
        let positions = cartographicTool.toCartesian3S(
            v.geometry.coordinates[0]
        );
        viewer.entities.add({
            polyline: new Cesium.PolylineGraphics({
                positions: positions,
                width: 30,
                material: new polylineTrailImageMaterial({
                    duration: 20000,
                    trailImage:
                        v.properties.name === "胶州湾生态魅力带"
                            ? require("./assets/img/blueLine.png")
                            : require("./assets/img/orangeLine.png"),
                }),
                clampToGround: true,
                zIndex: 3,
            }),
        });
    });
}

function addScan() {
    let { material, removeUpdate } = diffusedAppearance(viewer, {
        color: Cesium.Color.fromCssColorString("rgba(255,120,180,0.8)"),
    });
    pointJson.features.forEach((v) => {
        let position = cartographicTool.toCartesian3(v.geometry.coordinates);
        let segment = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.EllipseGeometry({
                    center: position,
                    semiMajorAxis: 1000,
                    semiMinorAxis: 1000,
                    vertexFormat: Cesium.VertexFormat.ALL,
                }),
            }),
            appearance: material,
        });
        viewer.scene.primitives.add(segment);

        viewer.entities.add({
            position: position,
            point: {
                color: Cesium.Color.ORANGE,
                pixelSize: 10,
            },
            label: {
                text: v.properties.name,
                font: "20px 黑体",
                verticalOrigin: 0,
                showBackground: true,
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.4),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            },
        });
    });
}

function addArea() {
    areaJson.features.forEach((v) => {
        let positions = cartographicTool.toCartesian3S(
            v.geometry.coordinates[0][0]
        );
        viewer.entities.add({
            polygon: {
                show: true,
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: Cesium.Color.fromCssColorString(
                    "rgba(40,200,240,0.3)"
                ),
                arcType: Cesium.ArcType.RHUMB,
                zIndex: 2,
            },
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.fromCssColorString("rgba(40,200,240,1)"),
                arcType: Cesium.ArcType.RHUMB,
                zIndex: 2,
            },
        });
    });
}

function addStreet() {
    streetJson.features.forEach((v) => {
        let coords = v.geometry.coordinates[0];
        if (v.geometry.type === "MultiPolygon") {
            // @ts-ignore
            coords = coords[0];
        }
        let positions = cartographicTool.toCartesian3S(
            // @ts-ignore
            coords
        );
        viewer.entities.add({
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.fromCssColorString("rgba(12,147,169,1)"),
                arcType: Cesium.ArcType.RHUMB,
                zIndex: 1,
            },
        });
    });
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
