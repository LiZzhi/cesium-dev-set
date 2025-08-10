<template>
    <CommPanel title="Geojson编辑" class="geojson-panel">
        <div style="color: #fff;">注：目前仅支持EPSG:4326</div>
        <div class="title">geojson绘制：</div>
        <div class="geojson-btns">
            <CommButton @click="drawFunc('point')">点</CommButton>
            <CommButton @click="drawFunc('polyline')">线</CommButton>
            <CommButton @click="drawFunc('polygon')">面</CommButton>
        </div>
        <div class="title">geojson管理：</div>
        <div class="geojson-btns">
            <CommButton @click="importJson">导入</CommButton>
            <CommButton @click="exportJson">导出</CommButton>
        </div>
        <div class="title">geojson编辑：</div>
    </CommPanel>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import { Color, Entity, JulianDate, PolygonHierarchy, ScreenSpaceEventHandler } from 'cesium';
import { ElMessage } from 'element-plus';
import drawShape from '@/secdev/specialEffectPlot/plot/drawShape';
import ObjectManagerTool, { objectManangeType } from '@/secdev/utils/objectManagerTool';
import entityFactory from '@/secdev/utils/entityFactory';
import uuid from '@/utils/uuid';
import cartographicTool from '@/secdev/utils/cartographicTool';
import saveShareContent from '@/utils/saveShareContent';
import loadJsonFile from '@/utils/loadJsonFile';

let draw: drawShape;
let tools: ObjectManagerTool;

let handler: ScreenSpaceEventHandler;

let all: Map<string, string> = new Map();
let choose: Set<string> = new Set();

onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.globe.depthTestAgainstTerrain = false;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    draw = new drawShape(viewer);
    tools = new ObjectManagerTool(viewer);
    eventHandler()
})

function drawFunc(type: string) {
    switch (type) {
        case "point":
            draw.drawMultiPoint((ps) => {
                ps.forEach((p) => {
                    let e = entityFactory.createPoint(p);
                    let objId = "point-" + uuid();
                    tools.addObject({
                        objId: objId,
                        objType: "Entity",
                        object: e,
                        objGroup: "point"
                    })
                    all.set(objId, "point")
                })
            });
            break;
        case "polyline":
            draw.drawPolyline((ps) => {
                let e = entityFactory.createPolyline(ps);
                let objId = "polyline-" + uuid();
                tools.addObject({
                    objId: objId,
                    objType: "Entity",
                    object: e,
                    objGroup: "polyline"
                })
                all.set(objId, "polyline")
            });
            break;
        case "polygon":
            draw.drawPolygon((ps) => {
                let e = createPloygon(
                    new Cesium.PolygonHierarchy(ps)
                );
                let objId = "polygon-" + uuid();
                tools.addObject({
                    objId: objId,
                    objType: "Entity",
                    object: e,
                    objGroup: "polygon"
                })
                all.set(objId, "polygon")
            });
            break;
        default:
            break;
    }
}

function eventHandler() {
    handler.setInputAction((e: any) => {
        let currentMoveObj = viewer.scene.pick(e.position);
        let {id, collection, primitive} = currentMoveObj || {};
        let element = null;
        let name = "";
        if (id instanceof Cesium.Entity) {
            // 优先判断是否是Entity
            element = id;
            name = id.name!;
        }
        if (element && name) {
            viewer.canvas.style.cursor = 'default';
            let { objGroup } = tools.getObjectInfoById(name)!;
            if (objGroup === "point" || objGroup === "polyline" || objGroup === "polygon") {
                let type = all.get(name)!;
                if (choose.has(name)) {
                    choose.delete(name);
                    highlight(type, element, Cesium.Color.fromCssColorString("rgb(22,236,255)"));
                } else {
                    choose.add(name);
                    highlight(type, element, Cesium.Color.YELLOW);
                }
            } else {
                let { objects } = tools.getOrCreateGroup(objGroup!)!;
                objects.forEach((e, i) => {
                    let type = all.get(i)!;
                    if (choose.has(i)) {
                        choose.delete(i);
                        highlight(type, e, Cesium.Color.fromCssColorString("rgb(22,236,255)"));
                    } else {
                        choose.add(i);
                        highlight(type, e, Cesium.Color.YELLOW);
                    }
                })
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function highlight(type: string, e: Entity, color: Color) {
    switch (type) {
        case "point":
            e.point!.outlineColor = new Cesium.ConstantProperty(color);
            break;
        case "polyline":
            e.polyline!.material = new Cesium.ColorMaterialProperty(color);
            break;
        case "polygon":
            e.polygon!.outlineColor = new Cesium.ConstantProperty(color);
            break;
        default:
            break;
    }
}

function importJson() {
    loadJsonFile({
        errFunc: () => {},
        endFunc: ({ fileName, filePath, jsonContext }) => {
            let data: objectManangeType[] = [];
            Cesium.GeoJsonDataSource.load(jsonContext).then((v) => {
                console.log(v);
                viewer.flyTo(v);
                let time = viewer.clock.currentTime;
                v.entities.values.forEach((e) => {
                    if (e.point || e.billboard) {
                        let position = e.position;
                        let point = entityFactory.createPoint(position!.getValue(time)!);
                        let id = "point-" + uuid();
                        data.push({
                            objId: id,
                            object: point,
                            objType: "Entity",
                        })
                        all.set(id, "point");
                    }
                    if (e.polyline) {
                        let positions = e.polyline.positions!.getValue(time)!;
                        let polyline = entityFactory.createPolyline(positions);
                        let id = "polyline-" + uuid();
                        data.push({
                            objId: id,
                            object: polyline,
                            objType: "Entity",
                        })
                        all.set(id, "polyline");
                    }
                    if (e.polygon) {
                        let hierarchy = e.polygon.hierarchy?.getValue(time)!;
                        let polygon = createPloygon(hierarchy);
                        let id = "polygon-" + uuid();
                        data.push({
                            objId: id,
                            object: polygon,
                            objType: "Entity",
                        })
                        all.set(id, "polygon");
                    }
                })
                tools.addObjGroup("group-" + uuid(), data, ({ dataSource }) => {
                    viewer.flyTo(dataSource);
                });
            })
        }
    })
}

function exportJson() {
    if (choose.size) {
        let featureCollection = turf.featureCollection([]);
        let time = viewer.clock.currentTime;
        choose.forEach((v) => {
            let e = tools.getObjectById(v) as Entity;
            let type = all.get(v);
            if (type === "point") {
                let c3 = e.position?.getValue(time);
                let degree = cartographicTool.formCartesian3(c3!, false);
                let point = turf.point(degree);
                featureCollection.features.push(point);
            } else if (type === "polyline") {
                let c3s = e.polyline?.positions?.getValue(time);
                let degrees = cartographicTool.formCartesian3S(c3s!, {
                    z: false
                });
                let polyline = turf.lineString(degrees);
                featureCollection.features.push(polyline);
            } else if (type === "polygon") {
                let hierarchy = e.polygon?.hierarchy?.getValue(time);
                let polygon = turf.polygon(
                    hierarchyToDegrees(hierarchy)
                );
                featureCollection.features.push(polygon);
            }
        })
        saveShareContent(JSON.stringify(featureCollection), uuid() + ".json")
    } else {
        ElMessage.warning("请先选择矢量");
    }
}

function hierarchyToDegrees(hierarchy: PolygonHierarchy) {
    let degrees = cartographicTool.formCartesian3S(hierarchy.positions, {
        z: false
    });
    let [firstLon, firstLat] = degrees[0];
    let [lastLon, lastLat] = degrees[degrees.length - 1];
    if (firstLon !== lastLon || firstLat !== lastLat) {
        degrees.push(degrees[0]);
    }
    let holes: number[][][] = [];
    if (hierarchy.holes?.length) {
        holes = hierarchy.holes.map((v) => {
            let holeDegrees = cartographicTool.formCartesian3S(v.positions, {
                z: false
            });
            let [holeFirstLon, holeFirstLat] = holeDegrees[0];
            let [holeLastLon, holeLastLat] = holeDegrees[holeDegrees.length - 1];
            if (holeFirstLon !== holeLastLon || holeFirstLat !== holeLastLat) {
                holeDegrees.push(degrees[0]);
            }
            return holeDegrees;
        })
    }
    return [
        degrees,
        ...holes,
    ]
}

function createPloygon(hierarchy: PolygonHierarchy) {
    return new Cesium.Entity({
        polygon: {
            hierarchy: hierarchy,
            material: new Cesium.ColorMaterialProperty(
                Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
            ),
            arcType: Cesium.ArcType.RHUMB,
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("rgb(22,236,255)"),
            outlineWidth: 1,
            height: 0,
        },
    });
}
</script>

<style lang='scss' scoped>
@import "./assets/style/index.scss";
</style>
