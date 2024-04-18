import { Cartesian3 } from "cesium";
import cartographicTool from "./cartographicTool";

export default function centerOfPolygon(positions: Cartesian3[]) {
    let coordinates = cartographicTool.formCartesian3S(positions, {
        z: false,
    });
    let start = coordinates[0];
    let end = coordinates[coordinates.length - 1];
    if (start[0] !== end[0] || start[1] !== end[1]) {
        coordinates.push(start);
    }
    let polygon = turf.polygon([coordinates]);
    let coord = turf.centerOfMass(polygon).geometry.coordinates;
    return Cesium.Cartesian3.fromDegrees(coord[0], coord[1]);
}
