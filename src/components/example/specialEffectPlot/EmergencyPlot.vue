<template>
    <CommPanel title="应急标绘" class="emergency-panel-box">
        <div class="emergency-panel">
            <div
                class="emergency-tab-item"
                v-for="(item, i) in emergencyList"
                :key="item.label"
            >
                <div class="tab-title">{{ item.label }}</div>
                <div class="tab-list">
                    <div
                        class="tab-item"
                        v-for="(tab, j) in item.children"
                        :key="tab.label"
                        @click="drawFunc(tab.label)"
                    >
                        <img :src="tab.icon" />
                        <div class="tab-label">{{ tab.label }}</div>
                    </div>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import drawPrimitive from "@/secdev/specialEffectPlot/plot/drawPrimitive";
import { BillboardCollection } from "cesium";

let draw: drawShape;
let drawEmergency: drawPrimitive;
let billboards: BillboardCollection;
let emergencyList = ref([
    {
        label: "火点",
        children: [
            {
                label: "火点1",
                icon: require("./assets/img/emergency/火点1.png"),
            },
            {
                label: "火点2",
                icon: require("./assets/img/emergency/火点2.png"),
            },
        ],
    },
    {
        label: "引导线",
        children: [
            {
                label: "引导线1",
                icon: require("./assets/img/emergency/引导线1.png"),
            },
            {
                label: "引导线2",
                icon: require("./assets/img/emergency/引导线2.png"),
            },
            {
                label: "引导线3",
                icon: require("./assets/img/emergency/引导线3.png"),
            },
        ],
    },
    {
        label: "态势",
        children: [
            {
                label: "集结区",
                icon: require("./assets/img/emergency/集结区.png"),
            },
            {
                label: "钳击箭头",
                icon: require("./assets/img/emergency/钳击箭头.png"),
            },
            {
                label: "单箭头",
                icon: require("./assets/img/emergency/单箭头.png"),
            },
            {
                label: "直箭头",
                icon: require("./assets/img/emergency/细直箭头.png"),
            },
        ],
    },
    {
        label: "预警",
        children: [
            {
                label: "隔离带",
                icon: require("./assets/img/emergency/隔离带.png"),
            },
            {
                label: "危险区域",
                icon: require("./assets/img/emergency/危险区域.png"),
            },
        ],
    },
]);

const drawFunc = (type: string) => {
    switch (type) {
        case "火点1":
            draw.drawPoint((position) => {
                billboards.add({
                    position: position,
                    image: require("./assets/img/emergency/火点1标.png"),
                });
            });
            break;
        case "火点2":
            draw.drawPoint((position) => {
                billboards.add({
                    position: position,
                    image: require("./assets/img/emergency/火点2标.png"),
                });
            });
            break;
        case "引导线1":
            drawEmergency.drawPolyline(
                {
                    width: 10,
                    loop: false,
                    appearance: new Cesium.PolylineMaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                type: "PolylineArrow",
                                uniforms: {
                                    color: Cesium.Color.RED,
                                },
                            },
                        }),
                    }),
                },
                (p) => {
                    viewer.scene.primitives.add(p);
                }
            );
            break;
        case "引导线2":
            drawEmergency.drawPolyline(
                {
                    width: 10,
                    loop: false,
                    appearance: new Cesium.PolylineMaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                type: "PolylineArrow",
                                uniforms: {
                                    color: Cesium.Color.fromCssColorString(
                                        "rgb(12, 211, 255)"
                                    ),
                                },
                            },
                        }),
                    }),
                },
                (p) => {
                    viewer.scene.primitives.add(p);
                }
            );
            break;
        case "引导线3":
            drawEmergency.drawPolyline(
                {
                    width: 10,
                    loop: false,
                    appearance: new Cesium.PolylineMaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                materials: {
                                    arrowMaterial: {
                                        type: "PolylineArrow",
                                        uniforms: {
                                            color: Cesium.Color.fromCssColorString(
                                                "rgb(255, 175, 0)"
                                            ),
                                        },
                                    },
                                    dashMaterial: {
                                        type: "PolylineDash",
                                    },
                                    headMaterial: {
                                        source: `
                                            czm_material czm_getMaterial(czm_materialInput materialInput) {
                                                czm_material material = czm_getDefaultMaterial(materialInput);
                                                vec2 st = materialInput.st;
                                                #ifdef GL_OES_standard_derivatives
                                                float base = 1.0 - abs(fwidth(st.s)) * 15.0 * czm_pixelRatio;
                                                #else
                                                float base = 0.975; // 2.5% of the line will be the arrow head
                                                #endif
                                                material.alpha = 1.0 - smoothstep(base - 0.0001, base, st.s);
                                                return material;
                                            }
                                        `,
                                    },
                                },
                                components: {
                                    diffuse: "arrowMaterial.diffuse",
                                    alpha: `
                                        arrowMaterial.alpha * (1.0 - (headMaterial.alpha * (1.0 - dashMaterial.alpha)));
                                        // czm_discard = false;
                                    `,
                                },
                            },
                        }),
                    }),
                },
                (p) => {
                    viewer.scene.primitives.add(p);
                }
            );
            break;
        case "集结区":
            drawEmergency.drawStagingArea((p) => {
                viewer.scene.primitives.add(p);
            });
            break;
        case "钳击箭头":
            drawEmergency.drawPincerArrow((p) => {
                viewer.scene.primitives.add(p);
            });
            break;
        case "单箭头":
            drawEmergency.drawSingleArrow((p) => {
                viewer.scene.primitives.add(p);
            });
            break;
        case "直箭头":
            drawEmergency.drawStraightArrow((p) => {
                viewer.scene.primitives.add(p);
            });
            break;
        case "隔离带":
            drawEmergency.drawPolyline(
                {
                    width: 10,
                    loop: false,
                    appearance: new Cesium.PolylineMaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                type: "PolylineDash",
                                uniforms: {
                                    color: Cesium.Color.WHITE,
                                    gapColor: Cesium.Color.BLACK.withAlpha(0.8),
                                },
                            },
                        }),
                    }),
                },
                (p) => {
                    viewer.scene.primitives.add(p);
                }
            );
            break;
        case "危险区域":
            drawEmergency.drawPolygon(
                {
                    outline: true,
                    outlineWidth: 3,
                    outlineAppearance: new Cesium.PolylineMaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                type: "Color",
                                uniforms: {
                                    color: Cesium.Color.RED,
                                },
                            },
                        }),
                    }),
                    fill: true,
                    fillAppearance: new Cesium.MaterialAppearance({
                        material: new Cesium.Material({
                            fabric: {
                                type: "Color",
                                uniforms: {
                                    color: Cesium.Color.RED.withAlpha(0.4),
                                },
                            },
                        }),
                    }),
                },
                (p) => {
                    viewer.scene.primitives.add(p);
                }
            );
            break;
        default:
            break;
    }
};

onMounted(() => {
    draw = new drawShape(viewer);
    drawEmergency = new drawPrimitive(viewer);
    billboards = new Cesium.BillboardCollection({
        scene: viewer.scene,
    });
    viewer.scene.primitives.add(billboards);
});
</script>

<style lang="scss" scoped>
@import "./assets/style/EmergencyPlot.scss";
</style>
