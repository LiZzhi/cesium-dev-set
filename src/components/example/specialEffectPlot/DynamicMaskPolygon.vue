<script setup lang="ts">
import { onMounted } from "vue";
import dynamicMaskAppearance from "@/secdev/specialEffectPlot/polygon/dynamicMaskAppearance";
import dynamicMaskAppearance2 from "@/secdev/specialEffectPlot/polygon/dynamicMaskAppearance2";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    let ps1 = [
        Cesium.Cartesian3.fromDegrees(120.36770123529838, 36.106542497232546),
        Cesium.Cartesian3.fromDegrees(120.38905298566688, 36.10706023329602),
        Cesium.Cartesian3.fromDegrees(120.39113291430132, 36.08229183810894),
        Cesium.Cartesian3.fromDegrees(120.36985921813391, 36.08237236832596),
        Cesium.Cartesian3.fromDegrees(120.36770123529838, 36.106542497232546),
    ];
    let m1 = dynamicMaskAppearance(viewer).material;
    let p1 = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(ps1),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: m1,
    });
    let ps2 = [
        Cesium.Cartesian3.fromDegrees(120.40028622735746, 36.12111309438317),
        Cesium.Cartesian3.fromDegrees(120.41587475460956, 36.09924454523713),
        Cesium.Cartesian3.fromDegrees(120.4390738267578, 36.11804251257056),
        Cesium.Cartesian3.fromDegrees(120.42578420416781, 36.142221040744126),
        Cesium.Cartesian3.fromDegrees(120.40028622735746, 36.12111309438317),
    ];
    let m2 = dynamicMaskAppearance2(viewer).material;
    let p2 = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(ps2),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: m2,
    });
    collection.add(p1);
    collection.add(p2);
});
</script>
