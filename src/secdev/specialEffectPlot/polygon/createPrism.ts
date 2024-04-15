/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-15 09:31:10
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-15 10:07:04
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\createPrism.ts
 * @Description: 创建棱柱
 */
import { Cartesian3, Color, GeometryInstance } from "cesium";
import deepClone from "@/utils/deepClone";

export type prismOptionType = {
    lineColor: Color; // 线颜色
    backColor: Color; // 柱面颜色
};

export default function (
    ps: Cartesian3[],
    height: number,
    extrudedHeight: number,
    option: Partial<prismOptionType> = {}
) {
    let o = defaultOptions();
    o = Object.assign(o, option);
    const collection = new Cesium.PrimitiveCollection();
    ps = deepClone(ps);
    let start = ps[0];
    let end = ps[ps.length - 1];
    if (start.x !== end.x || start.y !== end.y || start.z !== end.z) {
        ps.push(ps[0]);
    }
    let p1 = addPolygon(ps, height, extrudedHeight, o.backColor);
    let p2 = addLine(ps, height, extrudedHeight, o.lineColor);
    collection.add(p1);
    collection.add(p2);
    return collection;
}

/**
 * @description: 绘制柱面
 * @param {Cartesian3} ps 坐标
 * @param {number} height 低高
 * @param {number} extrudedHeight 顶高
 * @param {Color} color 颜色
 * @return {*}
 */
function addPolygon(
    ps: Cartesian3[],
    height: number,
    extrudedHeight: number,
    color: Color
) {
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(ps),
                height: height,
                extrudedHeight: extrudedHeight,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: "Color",
                    uniforms: {
                        color: color,
                    },
                },
            }),
            flat: false,
            faceForward: false,
            translucent: true,
            closed: false,
        }),
    });

    return primitive;
}

function addLine(
    ps: Cartesian3[],
    height: number,
    extrudedHeight: number,
    color: Color
) {
    const bottom: Cartesian3[] = [];
    const top: Cartesian3[] = [];
    const positions = ps.map((v) => {
        const { longitude, latitude } = Cesium.Cartographic.fromCartesian(v);
        let b = Cesium.Cartesian3.fromRadians(longitude, latitude, height);
        let t = Cesium.Cartesian3.fromRadians(
            longitude,
            latitude,
            extrudedHeight
        );
        bottom.push(b);
        top.push(t);
        return [b, t];
    });
    positions.push(bottom, top);
    let instances: GeometryInstance[] = [];
    positions.forEach((v) => {
        let geomInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: v,
                width: 3.0,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        instances.push(geomInstance);
    });

    let primitive = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type : Cesium.Material.PolylineGlowType,
                    uniforms: {
                        color: color,
                        glowPower: 0.3,
                    },
                },
            }),
        }),
    });
    return primitive;
}

function defaultOptions() {
    return {
        backColor: Cesium.Color.fromCssColorString("rgba(24, 65, 181, 0.5)"),
        lineColor: new Cesium.Color(0, 1, 1),
    };
}
