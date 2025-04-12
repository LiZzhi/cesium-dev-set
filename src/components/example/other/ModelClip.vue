<script setup lang="ts">
import { onMounted } from "vue";
import modelClip from "@/secdev/other/modelClip";

let clip: modelClip;
onMounted(() => {
    clip = new modelClip();
    let model = new Cesium.Cesium3DTileset({
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
    })
    viewer.scene.primitives.add(model)
    model.readyPromise.then((m) => {
        clip.clip(
            m,
            [
                new Cesium.Cartesian3(-1715407.8675213126, 4993484.191738727, 3566902.510973076),
                new Cesium.Cartesian3(-1715469.6720405214, 4993462.806607712, 3566903.5084893424),
                new Cesium.Cartesian3(-1715481.1135553163, 4993503.420120723, 3566843.528920003),
                new Cesium.Cartesian3(-1715419.953447327, 4993522.282143085, 3566845.3555843113),
            ]
        );
        viewer.flyTo(m);
    })
    // 加载3DTileset
    viewer.flyTo(
        viewer.scene.primitives.add(model)
    );
});
</script>
