import { Color, PolygonHierarchy } from "cesium";

export type waterOptionType = {
    baseWaterColor?: Color,  // 水颜色
    specularMap?: string; // 用于指示水域的单通道纹理
    normalMap?: string,   // 图像
    frequency?: number, // 波纹频率
    animationSpeed?: number,    // 波动速度
    amplitude?: number, // 波动振幅
    specularIntensity?: number, // 反射强度
}

export default function waterEffect(hierarchy: PolygonHierarchy, options: waterOptionType = {}){
    const polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: hierarchy,
        perPositionHeight: true,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });

    options = Object.assign(defaultOptions(), options)

    const primitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: polygon
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: { ...options, }
                }
            }),
            aboveGround: true
        }),
        show: true
    });
    return { primitive, options }
}

export function defaultOptions():waterOptionType {
    return {
        baseWaterColor: new Cesium.Color(0.117647, 0.564706, 1, 0.7),
        normalMap: require("../../assets/img/waterEffect/waterNormals.jpg"),
        frequency: 100,
        animationSpeed: 0.05,
        amplitude: 1,
        specularIntensity: 0.5,
    }
}