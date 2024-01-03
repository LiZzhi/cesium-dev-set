import { Cartographic, GeometryInstance, Viewer } from "cesium";

export type countColorType = {
    min: number;
    max: number;
    count: number;
    color: string;
}

export default class slopeAnalysis {
    #viewer: Viewer;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
    }

    async create(cats: number[][], steps: number = 10) {
        let ps = this.samplePositions(cats, steps);
        let updatedPositions = await Cesium.sampleTerrainMostDetailed(this.#viewer.scene.terrainProvider, ps);
        // 图例
        let countColorList = this.defaultCountColor;
        // 几何
        let lineGeom: GeometryInstance[] = [];
        let rectGeom: GeometryInstance[] = [];
        for (let k = 0; k < updatedPositions.length; k += 8) {
            // 第一个点与第五个点的坡度
            let slope1 = (updatedPositions[k].height - updatedPositions[k + 4].height) /
                Cesium.Cartesian3.distance(
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k].latitude, updatedPositions[k].longitude, updatedPositions[k].height),
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 4].latitude, updatedPositions[k + 4].longitude, updatedPositions[k + 4].height)
                )
            // 第二个点与第六个点的坡度
            let slope2 = (updatedPositions[k + 1].height - updatedPositions[k + 5].height) /
                Cesium.Cartesian3.distance(
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 1].latitude, updatedPositions[k + 1].longitude, updatedPositions[k + 1].height),
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 5].latitude, updatedPositions[k + 5].longitude, updatedPositions[k + 5].height)
                )
            // 第三个点与第七个点的坡度
            let slope3 = (updatedPositions[k + 2].height - updatedPositions[k + 6].height) /
                Cesium.Cartesian3.distance(
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 2].latitude, updatedPositions[k + 2].longitude, updatedPositions[k + 2].height),
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 6].latitude, updatedPositions[k + 6].longitude, updatedPositions[k + 6].height)
                )
            // 第四个点与第八个点的坡度
            let slope4 = (updatedPositions[k + 3].height - updatedPositions[k + 7].height) /
                Cesium.Cartesian3.distance(
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 3].latitude, updatedPositions[k + 3].longitude, updatedPositions[k + 3].height),
                    Cesium.Cartesian3.fromDegrees(updatedPositions[k + 7].latitude, updatedPositions[k + 7].longitude, updatedPositions[k + 7].height)
                )
            // 最大坡度值
            let slope = Math.max(Math.abs(slope1), Math.abs(slope2), Math.abs(slope3), Math.abs(slope4));
            // 方向线坐标
            let lineposition: number[] = [];
            if (slope === Math.abs(slope1)) {
                if (slope1 > 0) {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 4].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 4].latitude)
                    )
                } else {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 4].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 4].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k].latitude)
                    )
                }
            } else if (slope === Math.abs(slope2)) {
                if (slope2 > 0) {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 1].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 1].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 5].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 5].latitude)
                    )
                } else {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 5].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 5].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 1].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 1].latitude)
                    )
                }
            } else if (slope === Math.abs(slope3)) {
                if (slope3 > 0) {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 2].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 2].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 6].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 6].latitude)
                    )
                } else {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 6].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 6].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 2].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 2].latitude)
                    )
                }
            } else if (slope === Math.abs(slope4)) {
                if (slope4 > 0) {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 3].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 3].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 7].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 7].latitude)
                    )
                } else {
                    lineposition.push(
                        Cesium.Math.toDegrees(updatedPositions[k + 7].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 7].latitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 3].longitude),
                        Cesium.Math.toDegrees(updatedPositions[k + 3].latitude)
                    )
                }
            }
            // 四个坡度值大小有的差值特别大，这里取的平均值用来配置颜色
            slope = (Math.abs(slope1) + Math.abs(slope2) + Math.abs(slope3) + Math.abs(slope4)) / 4;
            // 分配数量
            let countColor: countColorType;
            for (let i = 0; i < countColorList.length; i++) {
                const element = countColorList[i];
                if (element.min <= slope && slope < element.max) {
                    countColor = element;
                    countColor.count++
                    break;
                }
            }
            lineGeom.push(new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: Cesium.Cartesian3.fromDegreesArray(lineposition),
                    arcType: Cesium.ArcType.RHUMB,
                    width: 8,
                }),
            }))
            rectGeom.push(new Cesium.GeometryInstance({
                geometry: new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromRadians(
                        updatedPositions[k + 4].longitude,
                        updatedPositions[k + 4].latitude,
                        updatedPositions[k].longitude,
                        updatedPositions[k].latitude,
                    ),
                }),
                attributes : {
                    color : Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.fromCssColorString(countColor!.color)
                    )
                }
            }))
        }
        let primitives = this.createPrimitives(lineGeom, rectGeom);
        return {
            primitives: primitives,
            countColor: countColorList,
        }
    }

    createPrimitives(lineGeom: GeometryInstance[], rectGeom: GeometryInstance[]) {
        let primitives = new Cesium.PrimitiveCollection();
        let line = new Cesium.GroundPolylinePrimitive({
            geometryInstances: lineGeom,
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: "PolylineArrow",
                        uniforms: {
                            color: Cesium.Color.fromCssColorString("#ff9090"),
                        },
                    },
                })
            }),
        });
        let rect = new Cesium.GroundPrimitive({
            geometryInstances: rectGeom,
        })
        primitives.add(rect);
        primitives.add(line);
        return primitives;
    }

    /**
     * @description: 采样网格
     * @param {number} cats 经纬度数组，前四个有效 [[lon, lat], [lon, lat], [lon, lat], [lon, lat]]
     * @param {number} steps (可选)采样步长，越大越精细，但是越慢，默认为10
     * @return {*}
     */
    samplePositions(cats: number[][], steps: number = 10) {
        let positions: Cartographic[] = [];
        let [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = this.getDegreesBoundary(cats);
        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                let h1 = [
                    x1 + ((x2 - x1) / steps) * i + ((x4 + ((x3 - x4) / steps) * i - x1 - ((x2 - x1) / steps) * i) / steps) * j,
					y1 + ((y2 - y1) / steps) * i + ((y4 + ((y3 - y4) / steps) * i - y1 - ((y2 - y1) / steps) * i) / steps) * j,
                ];
                let h2 = [
                    x1 + ((x2 - x1) / steps) * (i + 1) + ((x4 + ((x3 - x4) / steps) * (i + 1) - x1 - ((x2 - x1) / steps) * (i + 1)) / steps) * j,
					y1 + ((y2 - y1) / steps) * (i + 1) + ((y4 + ((y3 - y4) / steps) * (i + 1) - y1 - ((y2 - y1) / steps) * (i + 1)) / steps) * j,
                ];
                let h3 = [
                    x4 + ((x3 - x4) / steps) * (i + 1) - ((x4 + ((x3 - x4) / steps) * (i + 1) - x1 - ((x2 - x1) / steps) * (i + 1)) / steps) * (steps - 1 - j),
                    y4 + ((y3 - y4) / steps) * (i + 1) - ((y4 + ((y3 - y4) / steps) * (i + 1) - y1 - ((y2 - y1) / steps) * (i + 1)) / steps) * (steps - 1 - j),
                ];
                let h4 = [
                    x4 + ((x3 - x4) / steps) * i - ((x4 + ((x3 - x4) / steps) * i - x1 - ((x2 - x1) / steps) * i) / steps) * (steps - 1 - j),
					y4 + ((y3 - y4) / steps) * i - ((y4 + ((y3 - y4) / steps) * i - y1 - ((y2 - y1) / steps) * i) / steps) * (steps - 1 - j),
                ];
                positions.push(Cesium.Cartographic.fromDegrees(h1[0], h1[1]));
                positions.push(Cesium.Cartographic.fromDegrees((h1[0] + h2[0]) / 2, (h1[1] + h2[1]) / 2));
                positions.push(Cesium.Cartographic.fromDegrees(h2[0], h2[1]));
                positions.push(Cesium.Cartographic.fromDegrees((h2[0] + h3[0]) / 2, (h2[1] + h3[1]) / 2));
                positions.push(Cesium.Cartographic.fromDegrees(h3[0], h3[1]));
                positions.push(Cesium.Cartographic.fromDegrees((h3[0] + h4[0]) / 2, (h3[1] + h4[1]) / 2));
                positions.push(Cesium.Cartographic.fromDegrees(h4[0], h4[1]));
                positions.push(Cesium.Cartographic.fromDegrees((h4[0] + h1[0]) / 2, (h4[1] + h1[1]) / 2));
            }
        }
        return positions;
    }

    /**
     * @description: 调整参数
     * @param {*} cats
     * @return {*}
     */
    getDegreesBoundary(cats: number[][]) {
        let lons = cats.map(v => v[0]);
        let lats = cats.map(v => v[1]);
        let west = Math.min(...lons);
        let east = Math.max(...lons);
        let south = Math.min(...lats);
        let north = Math.max(...lats);
        return [
            [
                east,
                north,
            ],
            [
                west,
                north,
            ],
            [
                west,
                south,
            ],
            [
                east,
                south,
            ],
        ];
    }

    /**
     * @description: 颜色和阈值
     * @return {*}
     */
    get defaultCountColor(){
        let s = (Math.sqrt(2) / 2).toFixed(2);
        return [
            { min: 0, max: 0.29, count: 0, color: "#ff9090" },
            { min: 0.29, max: 0.5, count: 0, color: "#ff8080" },
            { min: 0.5, max: s, count: 0, color: "#ff7070" },
            { min: s, max: 0.87, count: 0, color: "#ff6060" },
            { min: 0.87, max: 0.91, count: 0, color: "#ff5050" },
            { min: 0.91, max: 0.95, count: 0, color: "#ff4040" },
            { min: 0.95, max: 1.00, count: 0, color: "#ff3030" },
        ] as countColorType[];
    }
}
