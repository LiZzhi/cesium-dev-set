import cartographicTool from "@/secdev/utils/cartographicTool";
import { Cartesian3, Color } from "cesium";
import flowLineAppearance from "../lineMaterial/flowLineAppearance";

export type cylinderMarkOptionType = {
    color: Color; // 颜色
    height: number; // 圆柱高度
    width: number; // 底部圆线宽
};

export default function (
    center: Cartesian3,
    radius: number,
    option: Partial<cylinderMarkOptionType> = {}
) {
    let o = defaultOptions(radius);
    o = Object.assign(o, option);
    const collection = new Cesium.PrimitiveCollection({
        destroyPrimitives: false,
    });

    let flowCircle = addFlowCircle(center, radius);
    let circleOutline = addCircleOutline(center, radius, o);
    let cylinder = addCylinder(center, radius, o);
    let streamer = addStreamer(center, radius, o);

    collection.add(flowCircle);
    collection.add(circleOutline);
    collection.add(cylinder);
    collection.add(streamer);

    return collection;
}

function addCircleOutline(
    center: Cartesian3,
    radius: number,
    option: cylinderMarkOptionType
) {
    let centerDegree = cartographicTool.formCartesian3(center, false);
    const circleJson = turf.circle(centerDegree, radius / 1000);
    let positions = cartographicTool.toCartesian3S(
        circleJson.geometry.coordinates[0]
    );

    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 10,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: flowLineAppearance(option.color),
    });
}

function addFlowCircle(center: Cartesian3, radius: number) {
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: flowCircleMaterial(Cesium.Color.WHITE),
    });
}

function flowCircleMaterial(color: Color) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: color,
                    innerRadius: 0.5,
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
                        v2 = smoothstep(1.0, mix(innerRadius, 0.5, 0.5), len);

                        // hole
                        v3 = smoothstep(innerRadius, mix(innerRadius, 0.5, 0.5), len);

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

function addCylinder(
    center: Cartesian3,
    radius: number,
    option: cylinderMarkOptionType
) {
    let centerDegree = cartographicTool.formCartesian3(center, false);
    const circleJson = turf.circle(centerDegree, (radius * 0.6) / 1000);
    let positions = cartographicTool.toCartesian3S(
        circleJson.geometry.coordinates[0]
    );
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: positions,
                maximumHeights: positions.map((v) => option.height),
                minimumHeights: positions.map((v) => 0),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    uniforms: {
                        color: option.color,
                    },
                    source: `
                        uniform vec4 color;

                        czm_material czm_getMaterial(czm_materialInput materialInput){
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            vec2 st = materialInput.st;

                            material.diffuse = color.rgb;
                            material.alpha = color.a * (1.0 - st.t) * 0.6;
                            return material;
                        }
                    `,
                },
            }),
        }),
    });
}

function addStreamer(
    center: Cartesian3,
    radius: number,
    option: cylinderMarkOptionType
) {
    let centerDegree = cartographicTool.formCartesian3(center, false);
    const circleJson = turf.circle(centerDegree, (radius * 0.7) / 1000);
    let positions = cartographicTool.toCartesian3S(
        circleJson.geometry.coordinates[0]
    );
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: positions,
                maximumHeights: positions.map((v) => option.height),
                minimumHeights: positions.map((v) => 0),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    uniforms: {
                        image: require("../../assets/img/cylinderMarking/streamer.png"),
                    },
                    source: `
                        uniform sampler2D image;

                        czm_material czm_getMaterial(czm_materialInput materialInput){
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            vec2 st = materialInput.st;
                            vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(2. * st.t - 1.0 * czm_frameNumber * 0.005)));
                            vec4 fragColor;
                            material.diffuse = colorImage.rgb;
                            material.alpha = colorImage.a;
                            return material;
                        }
                    `,
                },
            }),
        }),
    });
}

function defaultOptions(radius: number) {
    return {
        color: Cesium.Color.fromCssColorString("rgb(118, 72, 255)"),
        height: radius * 1.5,
        width: 100,
    };
}
