<script setup lang="ts">
import { onMounted, ref } from "vue";
import inundationAnalysis from "@/secdev/spatialAnalysis/inundationAnalysis";
import cartographicTool from "@/secdev/utils/cartographicTool";

let inundation: inundationAnalysis;
onMounted(() => {
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            -2624390.5545891286,
            4439767.707352671,
            3741766.411017696
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.161791647804304,
            -0.7147661333215063,
            0.000017661600685059398
        ),
    });
    inundation = new inundationAnalysis(viewer);
    let ps = [
        [120.5853567939587, 36.157969627216815],
        [120.58402414266229, 36.15593359444803],
        [120.58259822513378, 36.15397500523051],
        [120.58223746789903, 36.15203643125483],
        [120.58252616376834, 36.15124830231684],
        [120.5907943997969, 36.15241277408563],
        [120.58974110920803, 36.154464986026056],
        [120.58811094012788, 36.155518728390675],
        [120.5891697918752, 36.15673692145599],
        [120.58779268541483, 36.15841079699595],
        [120.5855351669286, 36.15820438717524],
        [120.5853567939587, 36.157969627216815],
    ];
    inundation.init(cartographicTool.toCartesian3S(ps), 50).then(() => {
        inundation.add();
    });
});
</script>
