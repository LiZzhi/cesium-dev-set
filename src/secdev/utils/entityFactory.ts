/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-28 11:34:05
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-28 17:51:35
 * @FilePath: \cesium-secdev-set\src\secdev\utils\entityFactory.ts
 * @Description: Entity工厂，快速构建简单的Entity几何
 */
import { Cartesian3, Entity, PolygonHierarchy, Property } from "cesium";
import uuid from "../../utils/uuid";

export default class entityFactory {
    static createPoint(
        position: Cartesian3,
        options: Entity.ConstructorOptions = {}
    ): Entity {
        let properties = {
            id: "point-" + uuid(),
            position: position,
            point: {
                color: Cesium.Color.fromCssColorString("rgb(0,67,72)"),
                pixelSize: 6,
                outlineWidth: 3,
                outlineColor:
                    Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        };
        let o = Object.assign(properties, options, {
            position: position,
        });
        let e = new Cesium.Entity(o);
        return e;
    }

    static createLabelPoint(
        position: Cartesian3,
        text: string|Property,
        options: Entity.ConstructorOptions = {}
    ): Entity {
        let properties = {
            id: "point-" + uuid(),
            position: position,
            point: {
                color: Cesium.Color.fromCssColorString("rgb(0,67,72)"),
                pixelSize: 6,
                outlineWidth: 3,
                outlineColor:
                    Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label:{
                text: text,
                font: '14pt bold monospace',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 4,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                backgroundColor: Cesium.Color.RED,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(0, -30)
            }
        };
        let o = Object.assign(properties, options, {
            position: position,
        });
        let e = new Cesium.Entity(o);
        return e;
    }

    static createPolyline(
        positions: Cartesian3[],
        options: Entity.ConstructorOptions = {}
    ) {
        let properties = {
            id: "polyline-" + uuid(),
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                clampToGround: true,
                arcType: Cesium.ArcType.RHUMB,
            },
        };
        if (options.polyline) {
            options.polyline.positions = positions;
        }
        let o = Object.assign(properties, options);
        console.log(o);
        let e = new Cesium.Entity(o);
        return e;
    }

    static createPloygon(
        positions: Cartesian3[],
        options: Entity.ConstructorOptions = {}
    ) {

        let hierarchyP = new Cesium.PolygonHierarchy(positions);
        let polylineP = positions.concat([positions[0]]);
        let properties = {
            id: "polygon-" + uuid(),
            polyline: {
                positions: polylineP,
                width: 3,
                material: Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                clampToGround: true,
                arcType: Cesium.ArcType.RHUMB,
            },
            polygon: {
                hierarchy: hierarchyP,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                ),
                arcType: Cesium.ArcType.RHUMB,
            },
        };
        if (options.polyline) {
            options.polyline.positions = polylineP;
        }
        if (options.polygon) {
            options.polygon.hierarchy = hierarchyP;
        }
        let o = Object.assign(properties, options);

        let e = new Cesium.Entity(o);
        return e;
    }

    static createCircle(
        position: Cartesian3,
        distance: number,
        options: Entity.ConstructorOptions = {}
    ) {
        let properties = {
            id: "circle-" + uuid(),
            position: position,
            ellipse: {
                semiMinorAxis: distance,
                semiMajorAxis: distance,
                fill: true,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                ),
            },
        };
        if (options.ellipse) {
            options.ellipse.semiMinorAxis = distance;
            options.ellipse.semiMajorAxis = distance;
        }
        let o = Object.assign(properties, options, {
            position: position,
        });

        let e = new Cesium.Entity(o);
        return e;
    }
}
