<script setup lang="ts">
import { onMounted, ref } from "vue";
import createCylinderMarking from "@/secdev/specialEffectPlot/polygon/createCylinderMarking";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    let dynamicMark = createCylinderMarking(
        Cesium.Cartesian3.fromDegrees(120.39423905810129, 36.096797113152064),
        300,
        {
            height: 2000,
        }
    );
    collection.add(dynamicMark);
});
</script>
