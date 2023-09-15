/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-08-28 11:34:05
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-09-15 14:55:29
 * @FilePath: \cesium-secdev-set\src\secdev\utils\entityFactory.ts
 * @Description: Entity工厂，快速构建简单的Entity几何
 */
import { Cartesian3, Cartographic, Entity, PolygonHierarchy, Property, Rectangle } from "cesium";
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

    static createLabel(
        position: Cartesian3,
        text: string|Property,
        options: Entity.ConstructorOptions = {}
    ): Entity {
        let properties = {
            id: "label-" + uuid(),
            position: position,
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
        if (options.label) {
            o.label.text = text;
        }
        let e = new Cesium.Entity(o);
        return e;
    }

    static createLabelPoint(
        position: Cartesian3,
        text: string|Property,
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
        let e = new Cesium.Entity(properties);
        return e;
    }

    static createPolyline(
        positions: Cartesian3[]|Property,
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
        let o = Object.assign(properties, options);
        if (options.polyline) {
            o.polyline.positions = positions;
        }
        let e = new Cesium.Entity(o);
        return e;
    }

    static createStraightPolyline(
        positions: Cartesian3[]|Property,
        options: Entity.ConstructorOptions = {}
    ) {
        let properties = {
            id: "polyline-" + uuid(),
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                arcType: Cesium.ArcType.NONE,
            },
        };

        let o = Object.assign(properties, options);
        if (options.polyline) {
            o.polyline.positions = positions;
        }
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
        let o = Object.assign(properties, options);

        if (options.polyline) {
            o.polyline.positions = polylineP;
        }
        if (options.polygon) {
            o.polygon.hierarchy = hierarchyP;
        }

        let e = new Cesium.Entity(o);
        return e;
    }

    static createHeightPloygon(
        hierarchy: PolygonHierarchy|Property,
        height: number|Property,
        options: Entity.ConstructorOptions = {}
    ){
        let properties = {
            id: "polygon-" + uuid(),
            polygon: {
                hierarchy: hierarchy,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                ),
                arcType: Cesium.ArcType.RHUMB,
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString("rgb(22,236,255)"),
                outlineWidth: 3,
                height: height,
            },
        };
        let o = Object.assign(properties, options);

        if (options.polygon) {
            o.polygon.hierarchy = hierarchy;
        }

        let e = new Cesium.Entity(o);
        return e;
    }

    static createCircle(
        position: Cartesian3|Property,
        distance: number|Property,
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

        let o = Object.assign(properties, options, {
            position: position,
        });
        if (options.ellipse) {
            o.ellipse.semiMinorAxis = distance;
            o.ellipse.semiMajorAxis = distance;
        }
        let e = new Cesium.Entity(o);
        return e;
    }

    static createHeightCircle(
        position: Cartesian3|Property,
        distance: number|Property,
        height: number|Property,
        options: Entity.ConstructorOptions = {},
    ){
        let properties = {
            id: "circle-" + uuid(),
            position: position,
            ellipse: {
                semiMinorAxis: distance,
                semiMajorAxis: distance,
                fill: true,
                outline: true,
                height: height,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                ),
            },
        };

        let o = Object.assign(properties, options, {
            position: position,
        });

        if (options.ellipse) {
            o.ellipse.semiMinorAxis = distance;
            o.ellipse.semiMajorAxis = distance;
        }

        let e = new Cesium.Entity(o);
        return e;
    }

    static createRectangle(
        rectangle: Rectangle|Property,
        options: Entity.ConstructorOptions = {},
    ){
        let properties = {
            id: "rectangle-" + uuid(),
            rectangle: {
                coordinates: rectangle,
                fill: true,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                ),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        };

        let o = Object.assign(properties, options);

        if (options.rectangle) {
            o.rectangle.coordinates = rectangle;
        }

        let e = new Cesium.Entity(o);
        return e;
    }
}
