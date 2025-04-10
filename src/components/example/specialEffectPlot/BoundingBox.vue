<script setup lang="ts">
import { onMounted } from "vue";
import createPrism from "@/secdev/specialEffectPlot/polygon/createPrism";
import createGradualPrism from "@/secdev/specialEffectPlot/polygon/createGradualPrism";

const collection = new Cesium.PrimitiveCollection();
onMounted(() => {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.primitives.add(collection);
    let ps1 = [
        Cesium.Cartesian3.fromDegrees(120.36214297535726, 36.09470167126347),
        Cesium.Cartesian3.fromDegrees(120.36830067572407, 36.095042100316206),
        Cesium.Cartesian3.fromDegrees(120.3684729083881, 36.09091043965406),
        Cesium.Cartesian3.fromDegrees(120.3624416047166, 36.09032398592348),
        Cesium.Cartesian3.fromDegrees(120.36214297535726, 36.09470167126347),
    ];
    let c1 = createPrism(ps1, 0, 100);
    let ps2 = [
        Cesium.Cartesian3.fromDegrees(120.36869128867684, 36.0906635719694),
        Cesium.Cartesian3.fromDegrees(120.38021193628501, 36.09086455195814),
        Cesium.Cartesian3.fromDegrees(120.38017177297665, 36.08677711818584),
        Cesium.Cartesian3.fromDegrees(120.36885429776011, 36.086802234297885),
        Cesium.Cartesian3.fromDegrees(120.36869128867684, 36.0906635719694),
    ];
    let c2 = createGradualPrism(ps2, 0, 100);
    collection.add(c1);
    collection.add(c2);
});
</script>
