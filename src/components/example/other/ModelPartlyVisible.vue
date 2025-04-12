<script setup lang="ts">
import { onMounted } from "vue";
import modelPartlyVisible from "@/secdev/other/modelPartlyVisible";

onMounted(() => {
    let partlyVisible = new modelPartlyVisible(viewer);
    partlyVisible.activate();
    partlyVisible.addRegion([
        new Cesium.Cartesian3(-1715407.8675213126, 4993484.191738727, 3566902.510973076),
        new Cesium.Cartesian3(-1715469.6720405214, 4993462.806607712, 3566903.5084893424),
        new Cesium.Cartesian3(-1715481.1135553163, 4993503.420120723, 3566843.528920003),
        new Cesium.Cartesian3(-1715419.953447327, 4993522.282143085, 3566845.3555843113),
    ])

    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
            })
        )
    );
});
</script>
