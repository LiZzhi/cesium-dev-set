<script setup lang="ts">
import { onMounted, ref } from "vue";
import dynamicWallMaterial from "@/secdev/specialEffectPlot/wall/dynamicWallMaterial";
import { Cartesian3 } from "cesium";

let collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    addWall(
        "vertical",
        [
            Cesium.Cartesian3.fromDegrees(120.36833433066616, 36.09502956940591),
            Cesium.Cartesian3.fromDegrees(120.38024939738007, 36.095587826881115),
            Cesium.Cartesian3.fromDegrees(120.38017333832343, 36.0868095102888),
            Cesium.Cartesian3.fromDegrees(120.368841624019, 36.08684209973187),
            Cesium.Cartesian3.fromDegrees(120.36833433066616, 36.09502956940591),
        ]
    );
    addWall(
        "horizontal",
        [
            Cesium.Cartesian3.fromDegrees(120.38841479847824, 36.0907224384223),
            Cesium.Cartesian3.fromDegrees(120.38489881192143, 36.09082576526032),
            Cesium.Cartesian3.fromDegrees(120.38481528459916, 36.08683722483511),
            Cesium.Cartesian3.fromDegrees(120.38695478736892, 36.0867731323762),
            Cesium.Cartesian3.fromDegrees(120.38843493602117, 36.08717192399958),
            Cesium.Cartesian3.fromDegrees(120.38841479847824, 36.0907224384223),
        ]
    )
});

function addWall(type: "vertical" | "horizontal", positions: Cartesian3[]) {
    collection.add(
        new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.WallGeometry({
                    positions: positions,
                    maximumHeights: new Array(positions.length).fill(100),
                    minimumHeights: new Array(positions.length).fill(0),
                }),
            }),
            appearance: new Cesium.MaterialAppearance({
                material: dynamicWallMaterial({
                    type,
                    direction: type === "vertical" ? false : true,
                    image:
                        type === "vertical"
                            ? require("./assets/img/verticalWall.png")
                            : require("./assets/img/horizontalWall.png"),
                }),
            }),
        })
    );
}
</script>
