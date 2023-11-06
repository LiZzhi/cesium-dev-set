import * as Cesium from "cesium";
import * as mapv from "@/thirdParty/mapv/mapv.js";
import * as turf from "@turf/turf";
import MapVLayer from "@/thirdParty/mapv/MapVLayer.js";
import heatmap from "@/thirdParty/heatmap/heatmap.js";
import echartsLayer from "@/thirdParty/echartsLayer/echartsLayer.js";
import token from "~/public/config/token.json";

window.Cesium = Cesium;
window.mapv = mapv;
window.MapVLayer = MapVLayer;
window.EchartsLayer = echartsLayer;
window.turf = turf;
window.h337 = heatmap;
// token
const cesiumToken = token.CESIUM_TOKEN;
Cesium.Ion.defaultAccessToken = cesiumToken;