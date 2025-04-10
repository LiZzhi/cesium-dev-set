<script setup lang="ts">
import { onMounted } from "vue";
import createDynamicMarking from "@/secdev/specialEffectPlot/polygon/createDynamicMarking";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    let { dynamicMark } = createDynamicMarking(
        viewer,
        Cesium.Cartesian3.fromDegrees(120.39423905810129, 36.096797113152064),
        1000
    );
    collection.add(dynamicMark);
});
</script>
