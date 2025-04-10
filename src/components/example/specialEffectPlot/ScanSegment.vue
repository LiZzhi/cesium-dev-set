<script setup lang="ts">
import { onMounted } from "vue";
import diffusedAppearance from "@/secdev/specialEffectPlot/polygon/diffusedAppearance";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    let { material } = diffusedAppearance(viewer, {
        color: Cesium.Color.YELLOW,
    });
    let primitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: Cesium.Cartesian3.fromDegrees(
                    120.39423905810129,
                    36.096797113152064
                ),
                semiMajorAxis: 2000,
                semiMinorAxis: 2000,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: material,
    });
    collection.add(primitive);
});
</script>
