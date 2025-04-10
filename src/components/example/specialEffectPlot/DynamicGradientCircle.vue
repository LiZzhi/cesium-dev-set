<script setup lang="ts">
import { onMounted } from "vue";
import dynamicGradientCircleAppearance from "@/secdev/specialEffectPlot/polygon/dynamicGradientCircleAppearance";
import { Cartesian3 } from "cesium";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    add(
        Cesium.Cartesian3.fromDegrees(120.38385225151433, 36.10072138705939),
        true
    )
    add(
        Cesium.Cartesian3.fromDegrees(120.4264610083466, 36.105221413717004),
        false
    )
});

function add(position: Cartesian3, isDynamic: boolean) {
    let { material } = dynamicGradientCircleAppearance(viewer, {
        isDynamic,
    });
    let primitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: position,
                semiMajorAxis: 2000,
                semiMinorAxis: 2000,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: material,
    });
    collection.add(primitive);
}
</script>
