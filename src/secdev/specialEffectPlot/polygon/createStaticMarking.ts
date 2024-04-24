import { Cartesian3, Color } from "cesium";

export type staticMarkOptionType = {
    color: Color; // 颜色
    innerRadius: number; // 内半径比例
    coneHeight: number; // 圆锥高度
    height: number; // 底高
};

export default function (
    center: Cartesian3,
    radius: number,
    option: Partial<staticMarkOptionType> = {}
) {
    let o = defaultOptions(radius);
    o = Object.assign(o, option);
    const collection = new Cesium.PrimitiveCollection({
        destroyPrimitives: false,
    });
    const p1 = addFlowCircle(center, radius, o);
    const p2 = addCone(center, radius, o);
    collection.add(p1);
    collection.add(p2);

    return collection;
}

function addFlowCircle(
    center: Cartesian3,
    radius: number,
    option: staticMarkOptionType
) {
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                height: option.height,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: flowCircleMaterial(option),
        asynchronous: false,
    });

    return primitive;
}

function addCone(
    center: Cartesian3,
    radius: number,
    option: staticMarkOptionType
) {
    let radin = Cesium.Cartographic.fromCartesian(center);
    let p = Cesium.Cartesian3.fromRadians(
        radin.longitude,
        radin.latitude,
        option.height + option.coneHeight / 2
    );

    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.CylinderGeometry({
                topRadius: 0.01,
                bottomRadius: radius / 10,
                length: option.coneHeight,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(p),
        }),
        appearance: coneMaterial(option),
    });

    return primitive;
}

function flowCircleMaterial(option: staticMarkOptionType) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: option.color,
                    innerRadius: option.innerRadius,
                },
                source: `
                    uniform vec4 color;
                    uniform float innerRadius;

                    vec4 extractAlpha(vec3 colorIn) {
                        vec4 colorOut;
                        float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
                        if (maxValue > 1e-5)
                        {
                            colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
                            colorOut.a = maxValue;
                        }
                        else
                        {
                            colorOut = vec4(0.0);
                        }
                        return colorOut;
                    }

                    float light1(float intensity, float attenuation, float dist) {
                        return intensity / (1.0 + dist * attenuation);
                    }

                    float light2(float intensity, float attenuation, float dist) {
                        return intensity / (1.0 + dist * dist * attenuation);
                    }


                    vec4 draw(vec2 uv) {
                        float len = length(uv);
                        float v0, v1, v2, v3, cl;
                        float r, d;

                        v0 = light1(1.0, 10.0, 0.);

                        // high light
                        d = distance(uv, vec2(0.));
                        v1 = light2(1.5, 5.0, d);
                        v1 *= light1(1.0, 50.0 , 0.);

                        // back decay
                        v2 = smoothstep(1.0, mix(innerRadius, 1.0, 0.5), len);

                        // hole
                        v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

                        // color

                        vec3 col = (color.rgb + v1) * v2 * v3;
                        col.rgb = clamp(col.rgb, 0.0, 1.0);

                        return extractAlpha(col);
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput) {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 2. - 1.;

                        vec4 col = draw(uv);

                        material.diffuse = mix(vec3(0.0), col.rgb, col.a); //normal blend
                        material.alpha = col.a;
                        return material;
                    }
                `,
            },
        }),
    });

    return m;
}

function coneMaterial(option: staticMarkOptionType) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: option.color,
                },
                source: `
                    uniform vec4 color;

                    float light1(float intensity, float attenuation, float dist) {
                        return intensity / (1.0 + dist * attenuation);
                    }

                    float light2(float intensity, float attenuation, float dist) {
                        return intensity / (1.0 + dist * dist * attenuation);
                    }

                    vec4 extractAlpha(vec3 colorIn) {
                        vec4 colorOut;
                        float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
                        if (maxValue > 1e-5)
                        {
                            colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
                            colorOut.a = maxValue;
                        }
                        else
                        {
                            colorOut = vec4(0.0);
                        }
                        return colorOut;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = -1. + 2. * materialInput.st;

                        float len = length(uv);

                        float v0 = light1(1.0, 10.0, 0.);
                        float d = distance(uv, vec2(0.));
                        float v1 = light2(1.5, 5.0, d);
                        v1 *= light1(1.0, 50.0 , 0.);
                        float v2 = smoothstep(1.0, mix(0.0, 1.0, 0.5), len);
                        float v3 = smoothstep(0.0, mix(0.0, 1.0, 0.5), len);
                        vec3 col = (color.rgb + v1) * v2 * v3;
                        col = clamp(col, 0.0, 1.0);
                        vec4 result = extractAlpha(col);

                        material.diffuse = result.rgb;
                        material.alpha = result.a;
                        return material;
                    }
                `,
            },
        }),
    });

    return m;
}


function defaultOptions(radius: number) {
    return {
        color: Cesium.Color.fromCssColorString("rgb(135, 184, 194)"),
        innerRadius: 0.8,
        coneHeight: radius * 2.0,
        height: 0.0,
    };
}
