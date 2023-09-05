import { Color, PolygonHierarchy } from "cesium";

export type waterOptionType = {
    baseWaterColor?: Color,
    normalMap?: string,
    frequency?: number,
    animationSpeed?: number,
    amplitude?: number,
}

export default function waterEffect(hierarchy: PolygonHierarchy, options: waterOptionType = {}){
    const polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: hierarchy,
        perPositionHeight: true,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });

    options = Object.assign(defaultOptions(), options)

    const primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: polygon
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: {
                        baseWaterColor: options.baseWaterColor,
                        normalMap: options.normalMap,
                        frequency: options.frequency,
                        animationSpeed: options.animationSpeed,
                        amplitude: options.amplitude
                    }
                }
            }),
            aboveGround: true
        }),
        show: true
    });
    return {
        primitive, options
    }
}

export function defaultOptions() {
    return {
        baseWaterColor: new Cesium.Color(0, 0.2941177, 0.2078431, 0.7),
        normalMap: require("../../assets/img/waterEffect/waterNormals.jpg"),
        // normalMap: require("../../assets/img/waterEffect/waterNormalsSmall.jpg"),
        frequency: 20,
        animationSpeed: 0.005,
        amplitude: 1,
    }
}