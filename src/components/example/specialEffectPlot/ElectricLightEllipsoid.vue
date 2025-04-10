<script setup lang="ts">
import { onMounted } from "vue";
import electricLightAppearance from "@/secdev/specialEffectPlot/polygon/electricLightAppearance";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    let { material } = electricLightAppearance(viewer, {
        alpha: 0.6,
    });
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipsoidGeometry({
                radii: new Cesium.Cartesian3(2000, 2000, 2000),
                maximumCone: Cesium.Math.PI_OVER_TWO,
            }),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
                Cesium.Cartesian3.fromDegrees(
                    120.39423905810129,
                    36.096797113152064
                )
            ),
        }),
        appearance: material,
    });
    collection.add(primitive);
});
</script>
