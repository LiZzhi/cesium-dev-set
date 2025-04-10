<script setup lang="ts">
import { onMounted, ref } from "vue";
import gradationWallImage from "@/secdev/specialEffectPlot/wall/gradationWallImage";

let dataSource = new Cesium.CustomDataSource();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.dataSources.add(dataSource);
    let color = Cesium.Color.RED;
    let img = gradationWallImage({
        0.0: color.withAlpha(1.0).toCssColorString().replace(")", ",1.0)"),
        0.045: color.withAlpha(0.8).toCssColorString(),
        0.1: color.withAlpha(0.6).toCssColorString(),
        0.15: color.withAlpha(0.4).toCssColorString(),
        0.37: color.withAlpha(0.2).toCssColorString(),
        0.54: color.withAlpha(0.1).toCssColorString(),
        1.0: color.withAlpha(0).toCssColorString(),
    });
    let positions = [
        Cesium.Cartesian3.fromDegrees(120.36842598080877, 36.09505888320935),
        Cesium.Cartesian3.fromDegrees(120.38012133980197, 36.095620896540915),
        Cesium.Cartesian3.fromDegrees(120.38015540342086, 36.082708523229954),
        Cesium.Cartesian3.fromDegrees(120.3691859572397, 36.08287783207193),
        Cesium.Cartesian3.fromDegrees(120.36842598080877, 36.09505888320935),
    ];
    dataSource.entities.add({
        wall: {
            positions: positions,
            maximumHeights: new Array(positions.length).fill(200),
            minimumHeights: new Array(positions.length).fill(0),
            material: new Cesium.ImageMaterialProperty({
                transparent: true, //设置透明
                image: img,
            }),
        },
    });
});
</script>
