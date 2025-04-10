<template>
    <CommPanel title="区域标注" class="area-panel-box">
        <div class="area-panel">
            <div class="btn-group">
                <CommButton @click="setVisible(i)" v-for="(item, i) in labels" :key="item.label">{{ item.label }}</CommButton>
            </div>
            <div class="btn-group2">
                <CommButton @click="setVisibleAll(true)" class="show">全部显示</CommButton>
                <CommButton @click="setVisibleAll(false)" class="clear">全部隐藏</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cartesian3, Label, GroundPolylinePrimitive, Primitive } from "cesium";
import gradientAppearance from "@/secdev/specialEffectPlot/polygon/gradientAppearance";

type areaLabelType = {
    label: Label,
    polyline: GroundPolylinePrimitive,
    polygon: Primitive
}

const json = require("./assets/json/arealabel.json");
const arealabelList: areaLabelType[] = [];

onMounted(() => {
    const coords = processCoordinates(json);
    const labelCollection = new Cesium.LabelCollection({ scene: viewer.scene });
    viewer.scene.primitives.add(labelCollection)
    coords.forEach((v, i)=>{
        const polygon = viewer.scene.primitives.add(
            new Cesium.GroundPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(coords[i]),
                        vertexFormat: Cesium.VertexFormat.ALL
                    })
                }),
                appearance: gradientAppearance(colors[i].withAlpha(0.3)),
            })
        )
        const polyline = viewer.scene.primitives.add(
            new Cesium.GroundPolylinePrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.GroundPolylineGeometry({
                        positions: coords[i],
                        width: 2,
                    })
                }),
                appearance: new Cesium.MaterialAppearance({
                    material:  new Cesium.Material({
                        fabric : {
                            type : 'PolylineDash',
                            uniforms : {
                                color : colors[i]
                            }
                        }
                    }),
                }),
            })
        )
        const label = labelCollection.add({
            position: labels[i].position,
            text: labels[i].label,
            fillColor: colors[i],
            scale: 0.5,
            font: 'normal 45px MicroSoft YaHei',
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 9000000),
            scaleByDistance: new Cesium.NearFarScalar(50000, 1, 500000, 0.5),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            outlineWidth: 10,
            outlineColor: Cesium.Color.BLACK,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        })
        arealabelList.push({
            label, polyline, polygon
        })
    })
    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(-1238032.1540224112, 5023944.614962174, 3733248.6348458533),
        orientation: new Cesium.HeadingPitchRoll(0.1297652033768466, -0.9909836366475395, 0.033353019194416085),
        duration: 1
    })
});

const setVisible = (i: number) => {
    const item = arealabelList[i]
    item.label.show = !item.label.show;
    item.polyline.show = !item.polyline.show;
    item.polygon.show = !item.polygon.show;
}

const setVisibleAll = (visible: boolean) => {
    arealabelList.forEach(v => {
        v.label.show = visible;
        v.polyline.show = visible;
        v.polygon.show = visible;
    })
}

const colors = [
    Cesium.Color.AQUA,
    Cesium.Color.GREEN,
    Cesium.Color.YELLOW,
    Cesium.Color.RED
];

const labels = [{
    position: Cesium.Cartesian3.fromDegrees(103.88545983932153, 36.033216960244246),
    label: '沿河区'
}, {
    position: Cesium.Cartesian3.fromDegrees(103.87214667212257, 36.038301982724796),
    label: '环城区'
}, {
    position: Cesium.Cartesian3.fromDegrees(103.86194888078703, 36.03969446525105),
    label: '封控区'
}, {
    position: Cesium.Cartesian3.fromDegrees(103.85091307483806, 36.041102519445715),
    label: '核心区'
}];

const processCoordinates = (json: any)=>{
    const jsonCartesian3S: Cartesian3[][] = []
    json.features.forEach((v: any) => {
        const coords: number[] = v.geometry.coordinates.flat(2);
        jsonCartesian3S.push(Cesium.Cartesian3.fromDegreesArray(coords));
    });
    return jsonCartesian3S;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/AreaLabel.scss";
</style>
