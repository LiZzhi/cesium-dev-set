/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-15 09:31:10
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-16 11:17:57
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\createGradualPrism.ts
 * @Description: 创建棱柱
 */
import { Cartesian3, Color, GeometryInstance } from "cesium";
import flowLineAppearance from "../lineMaterial/flowLineAppearance";
import deepClone from "@/utils/deepClone";

export default function (
    ps: Cartesian3[],
    height: number,
    extrudedHeight: number,
    color = Cesium.Color.RED
) {
    const collection = new Cesium.PrimitiveCollection();
    ps = deepClone(ps);
    let start = ps[0];
    let end = ps[ps.length - 1];
    if (start.x !== end.x || start.y !== end.y || start.z !== end.z) {
        ps.push(ps[0]);
    }
    let p1 = addWall(ps, height, extrudedHeight, color);
    let p2 = addLine(ps, height, extrudedHeight, color);
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
function addWall(
    ps: Cartesian3[],
    height: number,
    extrudedHeight: number,
    color: Color
) {
    let instances: GeometryInstance[] = [];
    for (let i = 1; i < ps.length; i++) {
        let positions = [ps[i - 1], ps[i]];
        let geomInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: positions,
                maximumHeights: positions.map((v) => extrudedHeight),
                minimumHeights: positions.map((v) => height),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        instances.push(geomInstance);
    }
    let primitive = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: wallAppearance(color),
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
                width: 10.0,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        instances.push(geomInstance);
    });

    let primitive = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: flowLineAppearance(color.withAlpha(0.5)),
    });
    return primitive;
}

function wallAppearance(color: Color) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: color,
                },
                source: `
                    uniform vec4 color;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);

                        vec2 st = -1. + 2. * materialInput.st;
                        float a = length(st + vec2(0., -0.25));

                        material.diffuse = color.rgb * pow(a, 5.);
                        material.alpha = a * .3;
                        return material;
                    }
                `,
            },
        }),
    });
    return m;
}
