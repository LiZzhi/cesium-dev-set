<script setup lang="ts">
import { onMounted } from "vue";
import radarScanLine from "@/secdev/specialEffectPlot/plot/radarScanLine";

let scanLine: radarScanLine;
onMounted(() => {
    // 开启深度
    viewer.scene.globe.depthTestAgainstTerrain = true;

    scanLine = new radarScanLine(viewer);
    scanLine.create(Cesium.Cartesian3.fromDegrees(120.39423905810129, 36.096797113152064), 1000, Cesium.Color.YELLOW, 4000);
});
</script>
