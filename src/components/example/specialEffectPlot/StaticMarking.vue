<script setup lang="ts">
import { onMounted } from "vue";
import createStaticMarking from "@/secdev/specialEffectPlot/polygon/createStaticMarking";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    let primitive = createStaticMarking(
        Cesium.Cartesian3.fromDegrees(120.39423905810129, 36.096797113152064),
        1000
    );
    collection.add(primitive);
});
</script>
