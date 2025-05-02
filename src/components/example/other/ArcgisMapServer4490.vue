<script setup lang="ts">
import ArcGisMapServerImageryProvider4490 from "@/secdev/other/ArcGisMapServerImageryProvider4490";
import { onMounted } from "vue";

onMounted(() => {
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(-2004916.241245129, 5967700.57143939, 2605135.4985324456),
        orientation: new Cesium.HeadingPitchRoll(5.9822346849844905, -1.4594252029019041, 6.283012480482637),
    })
    const provider: any = new ArcGisMapServerImageryProvider4490({
        url: new Cesium.Resource({
            url: "https://gishub.nnrig.com/arcgis/rest/services/map/08dd83cc-e285-4121-870f-0c5240a91ce0/mapserver",
            headers: {
                token: window.$config.token.NANNING_TOKEN
            }
        }),
    });
    viewer.imageryLayers.addImageryProvider(provider);
});
</script>