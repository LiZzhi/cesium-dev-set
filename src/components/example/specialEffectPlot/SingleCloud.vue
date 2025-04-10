<script setup lang="ts">
import { onMounted } from "vue";

const collection = new Cesium.CloudCollection();
onMounted(() => {
    viewer.scene.primitives.add(collection);
    addCloud(120.38092567775948, 36.08503123226218);
    addCloud(120.38301331752339, 36.089248986239156);
    addCloud(120.387929186508, 36.08324641942702);
    addCloud(120.39683629013554, 36.08705512068803);
});

function addCloud(lon: number, lat: number) {
    collection.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
        maximumSize: new Cesium.Cartesian3(20, 12, 15),
        scale: new Cesium.Cartesian2(2000, 1000),
        slice: 0.5,
        color: Cesium.Color.WHITE,
        brightness: 1.0,
    });
}
</script>
