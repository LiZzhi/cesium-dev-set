import * as Cesium from "cesium";
import * as mapv from "@/thirdParty/mapv/mapv.js";
import MapVLayer from "@/thirdParty/mapv/MapVLayer.js";

window.Cesium = Cesium;
window.mapv = mapv;
window.MapVLayer = MapVLayer;
// token
const cesiumToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOTNiYjkwZi1iMzRlLTRjZWQtYWQxMy00MDVmMjk4YTc0YmMiLCJpZCI6MzY3MDksImlhdCI6MTY1NTE3OTc1N30.fv4nNIkCEEy3VqlaekWVcE1btEcge5_zCl_36AtusT0";
Cesium.Ion.defaultAccessToken = cesiumToken;