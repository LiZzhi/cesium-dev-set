<template>
    <CommPanel title="立体效果" class="clip-panel-box">
        <div class="clip-panel">
            <CommButton @click="">显示</CommButton>
            <CommButton @click="" contentClass="clear">隐藏</CommButton>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Cartesian3, Appearance, Color } from "cesium";
import qingdao from "./assets/json/青岛市.json";
import qingdaoInner from "./assets/json/青岛市-in.json";
import dynamicLabelPoint from "@/secdev/specialEffectPlot/domPoint/dynamicLabelPoint";
import gradationWallImage from "@/secdev/specialEffectPlot/wall/gradationWallImage";

let border = qingdao.features[0].geometry.coordinates;
let borderC3 = border.map((coord) => {
    let c3s: Cartesian3[] = [];
    coord[0].forEach((v) => {
        c3s.push(Cesium.Cartesian3.fromDegrees(v[0], v[1]));
    });
    return c3s;
});

let labels: { label: string; coord: number[] }[] = [];
let innerC3 = qingdaoInner.features
    .map((v) => {
        labels.push({
            label: v.properties.name,
            coord: v.properties.center,
        });
        let c3ss = v.geometry.coordinates.map((coord) => {
            let c3s: Cartesian3[] = [];
            coord[0].forEach((v) => {
                c3s.push(Cesium.Cartesian3.fromDegrees(v[0], v[1]));
            });
            return c3s;
        });
        return c3ss;
    })
    .flat(1);

onMounted(() => {
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 调整饱和度
    let layer = viewer.imageryLayers.get(0);
    layer.saturation = 0.3;

    // 渐变墙
    addWall(
        borderC3,
        5000,
        wallMaterial({
            0.0: "rgba(32,65,75,0.5)",
            0.5: "rgba(63,115,130,0.5)",
            1.0: "rgba(65,132,204,0.5)",
        })
    );

    // 发光线
    addBorder(
        innerC3,
        10,
        new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: Cesium.Material.PolylineGlowType,
                    uniforms: {
                        color: Cesium.Color.fromCssColorString(
                            "rgb(65,132,204)"
                        ),
                    },
                },
            }),
        }),
        new Cesium.Cartesian3(0, 0, 5000)
    );

    addCircle(
        new Cesium.Cartesian3(
            -2586302.72678635,
            4447448.813500654,
            3765662.8725762567
        ),
        110270.78359900268,
        new Cesium.Cartesian3(0, 0, 3000)
    );

    labels.forEach((v) => {
        let p = new dynamicLabelPoint(
            viewer,
            {
                lon: v.coord[0],
                lat: v.coord[1],
                height: 5000,
            },
            v.label
        );
        p.init();
    });

    addInner();

    viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(
            -2739901.680409191,
            4705954.197375935,
            3727704.3452687482
        ),
        orientation: new Cesium.HeadingPitchRoll(
            6.249615322291631,
            -0.9035881731401787,
            0.0000026632450982333467
        ),
    });
});

function addWall(c3s: Cartesian3[][], height: number, appearance: Appearance) {
    let wallInstances = c3s.map((v) => {
        let geomInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: v,
                minimumHeights: v.map(() => 0),
                maximumHeights: v.map(() => height),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        return geomInstance;
    });

    let borderprimitive = new Cesium.Primitive({
        geometryInstances: wallInstances,
        appearance: appearance,
    });
    viewer.scene.primitives.add(borderprimitive);
}

// 位移
function displacement(center: Cartesian3, offset: Cartesian3) {
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    const result = Cesium.Matrix4.multiplyByPoint(
        transform,
        offset,
        new Cesium.Cartesian3()
    );
    const world_translation = Cesium.Cartesian3.subtract(
        result,
        center,
        new Cesium.Cartesian3()
    );
    return Cesium.Matrix4.fromTranslation(world_translation);
}

function addBorder(
    c3s: Cartesian3[][],
    width: number,
    appearance: Appearance,
    offset: Cartesian3
) {
    let borderInstances = c3s.map((v) => {
        let geomInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: v,
                width: width,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        return geomInstance;
    });

    let borderprimitive = new Cesium.Primitive({
        geometryInstances: borderInstances,
        // appearance: flowLineAppearance(Cesium.Color.fromCssColorString("rgb(65,132,204)")),
        appearance: appearance,
    });
    viewer.scene.primitives.add(borderprimitive);
    borderprimitive.readyPromise.then(() => {
        borderprimitive.modelMatrix = displacement(
            // @ts-ignore
            borderprimitive._boundingSpheres[0].center,
            offset
        );
    });
    return borderprimitive;
}

function addInner() {
    let innerInstances = innerC3.map((v) => {
        let geomInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(v),
                height: 5000,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        });
        return geomInstance;
    });

    let innerprimitive = new Cesium.Primitive({
        geometryInstances: innerInstances,
        appearance: colorAppearance(
            Cesium.Color.fromCssColorString("rgb(65,132,204)").withAlpha(0.3)
        ),
    });
    viewer.scene.primitives.add(innerprimitive);
}

function colorAppearance(color: Color, isLine: boolean = false) {
    let appearance = isLine
        ? Cesium.PolylineMaterialAppearance
        : Cesium.MaterialAppearance;
    return new appearance({
        material: new Cesium.Material({
            fabric: {
                type: "Color",
                uniforms: {
                    color: color,
                },
            },
        }),
    });
}

function addCircle(center: Cartesian3, radius: number, offset: Cartesian3) {
    let { material } = circleMaterial();
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: material,
    });
    viewer.scene.primitives.add(primitive);

    primitive.readyPromise.then(() => {
        primitive.modelMatrix = displacement(
            // @ts-ignore
            primitive._boundingSpheres[0].center,
            offset
        );
    });
}

function circleMaterial() {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    time: 0,
                },
                source: `
                    uniform float time;

                    const float M_PI = 3.1415926535897932384626433832795;

                    const vec3 blue1 = vec3(1., 1., 1.);
                    const vec3 blue2 = vec3(65./255., 132./255., 204./255.);

                    float SMOOTH(float r, float R)
                    {
                        return 1.0-smoothstep(R-1.0,R+1.0, r);
                    }

                    float circle(vec2 uv, vec2 center, float radius, float width)
                    {
                        float r = length(uv - center);
                        return SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius);
                    }

                    float circle2(vec2 uv, vec2 center, float radius, float width, float opening)
                    {
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        d = normalize(d);
                        if( abs(d.x) > opening )
                            return SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius);
                        else
                            return 0.0;
                    }

                    float circle3(vec2 uv, vec2 center, float radius, float width, float du)
                    {
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        d = normalize(d);
                        float theta = 180.0*(atan(d.y,d.x)/M_PI);
                        return smoothstep(2.0, 2.1, abs(mod(theta+2.0,du)-2.0)) *
                            mix( 0.5, 1.0, step(du, abs(mod(theta, 36.0)-90.0)) ) *
                            (SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius));
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 640.;

                        vec3 finalColor; // 颜色
                        float alpha; // 透明度

                        vec2 c = vec2(640.) / 2.; // 中心

                        // 两个内圈
                        // float circle_result_1 = circle(uv, c, 100.0, 2.0) + circle(uv, c, 165.0, 1.0);
                        // finalColor += circle_result_1 * blue1;
                        // alpha += circle_result_1;
                        // 粗圈
                        float circle3_result = circle3(uv, c, 262.0, 10.0, 0.);
                        finalColor += circle3_result * blue1;
                        alpha += circle3_result * .65;
                        // 虚线圈
                        float circle3_result2 = circle3(uv, c, 230.0, 2.0, 10.);
                        finalColor += circle3_result2 * blue1;
                        alpha += circle3_result2 * .65;
                        // 动态圈1
                        float circle2_result = circle2(uv, c, 320.0, 5.0, 0.65+0.2*cos(time));
                        finalColor += circle2_result * blue2 / 0.5;
                        alpha += circle2_result;
                        // 动态圈2
                        float circle2_result2 = circle2(uv, c, 310.0, 1.0, 0.65+0.2*cos(time));
                        finalColor += 0.7 * circle2_result2 * blue1;
                        alpha += circle2_result2 * .65;

                        material.diffuse = finalColor;
                        material.alpha = alpha * .5;

                        return material;
                    }
                `,
            },
            translucent: true,
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false,
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds = (performance.now() - startTime) / 1000;
        m.material.uniforms = {
            time: elapsedTimeSeconds,
        };
    }
    viewer.scene.preRender.addEventListener(update);
    function removeUpdate() {
        viewer.scene.preRender.removeEventListener(update);
    }
    return {
        material: m,
        removeUpdate: removeUpdate,
    };
}

function wallMaterial(option: Record<number, string>) {
    return new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                type: Cesium.Material.ImageType,
                uniforms: {
                    image: gradationWallImage(option),
                },
            },
        }),
    });
}
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
