import { Viewer } from "cesium";

export default async function(
    viewer: Viewer,
    lon: number,
    lat: number
): Promise<number>{
    let terrain = viewer.terrainProvider;
    let ready = await terrain.readyPromise;
    if (ready) {
        // 地形为空（标准椭球）
        if (!terrain.availability) {
            return 0;
        }
        let updatedPositions = await Cesium.sampleTerrainMostDetailed(
            terrain,
            [Cesium.Cartographic.fromDegrees(lon, lat)]
        );
        return updatedPositions[0]?.height || 0;
    }
    return 0;
};
