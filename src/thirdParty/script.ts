import * as Cesium from "cesium";
import * as mapv from "@/thirdParty/mapv/mapv.js";
import * as turf from "@turf/turf";
import MapVLayer from "@/thirdParty/mapv/MapVLayer.js";
import heatmap from "@/thirdParty/heatmap/heatmap.js";
import echartsLayer from "@/thirdParty/echartsLayer/echartsLayer.js";
import cesiumNavigation from "@/thirdParty/cesiumNavigation/CesiumNavigation"
import CesiumResourceCacheExtend from "@/secdev/utils/CesiumResourceCacheExtend";

window.Cesium = Cesium;
window.mapv = mapv;
window.MapVLayer = MapVLayer;
window.EchartsLayer = echartsLayer;
window.turf = turf;
window.h337 = heatmap;
window.CesiumNavigation = cesiumNavigation;
// 开启缓存扩展
let cacheExtend = new CesiumResourceCacheExtend();
cacheExtend.rules = ["*"];
cacheExtend.init();
// token
Cesium.Ion.defaultAccessToken = window.$config.token.CESIUM_TOKEN;
// Cesium最大并发值
Cesium.RequestScheduler.maximumRequestsPerServer = 18;
Cesium.RequestScheduler.throttleRequests = true;