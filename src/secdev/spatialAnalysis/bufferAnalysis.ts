export default class bufferAnalysis {
    static pointBuffer(point: number[], distance: number) {
        let p = turf.point([point[0], point[1]]);
        let buffer = turf.buffer(p, distance, { units: "meters" });
        let geom = buffer.geometry.coordinates[0];
        return geom;
    }

    static polylineBuffer(polyline: number[][], distance: number) {
        let l = turf.lineString(polyline);
        let buffer = turf.buffer(l, distance, { units: "meters" });
        console.log(buffer);
        let geom = buffer.geometry.coordinates[0];
        return geom;
    }

    static polygonBuffer(polygon: number[][][], distance: number) {
        let a = turf.polygon(polygon);
        let buffer = turf.buffer(a, distance, { units: "meters" });
        console.log(buffer);
        let geom = buffer.geometry.coordinates[0];
        return geom;
    }
}
