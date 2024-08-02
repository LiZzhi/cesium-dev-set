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
import maskLayer from "@/secdev/cameraView/maskLayer";
import flowLineAppearance from "@/secdev/specialEffectPlot/lineMaterial/flowLineAppearance";
import dynamicLabelPoint from "@/secdev/specialEffectPlot/domPoint/dynamicLabelPoint";

let border = qingdao.features[0].geometry.coordinates;
let borderC3 = border.map((coord) => {
    let c3s: Cartesian3[] = [];
    coord[0].forEach((v) => {
        c3s.push(Cesium.Cartesian3.fromDegrees(v[0], v[1]));
    });
    return c3s;
});

let labels = [];
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
    // let mask = new maskLayer(viewer);
    // mask.create(
    //     borderC3.map((v) => new Cesium.PolygonHierarchy(v)),
    //     {
    //         wall: false,
    //         alpha: 0.5,
    //     }
    // );
    // 调整饱和度
    let layer = viewer.imageryLayers.get(0);
    layer.saturation = 0.3;
    addBorder(
        borderC3,
        5,
        colorAppearance(Cesium.Color.fromCssColorString("rgb(32,65,75)"), true),
        // flowLineAppearance(Cesium.Color.fromCssColorString("rgb(32,65,75)")),
        new Cesium.Cartesian3(0, 0, 1000)
    );
    addBorder(
        borderC3,
        5,
        colorAppearance(
            Cesium.Color.fromCssColorString("rgb(63,115,130)"),
            true
        ),
        // flowLineAppearance(Cesium.Color.fromCssColorString("rgb(63,115,130)")),
        new Cesium.Cartesian3(0, 0, 3000)
    );

    // addBorder(
    //     innerC3,
    //     10,
    //     // colorAppearance(Cesium.Color.fromCssColorString("rgb(109,215,248)"), true),
    //     flowLineAppearance(Cesium.Color.fromCssColorString("rgb(109,215,248)")),
    //     new Cesium.Cartesian3(0, 0, 5000)
    // );
    // 最上
    let b = addBorder(
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
        // flowLineAppearance(Cesium.Color.fromCssColorString("rgb(109,215,248)")),
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
        let p = new dynamicLabelPoint(viewer, {
            lon: v.coord[0],
            lat: v.coord[1],
            height: 5000,
        }, v.label)
        p.init();
    })

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

                    // const vec3 blue1 = vec3(0.74,0.95,1.00);
                    // const vec3 blue2 = vec3(0.87,0.98,1.00);
                    // const vec3 blue3 = vec3(0.35,0.76,0.83);

                    const vec3 blue1 = vec3(0.3, 0.3, 0.3);
                    const vec3 blue2 = vec3(65./255., 132./255., 204./255.);
                    const vec3 blue3 = vec3(65./255., 132./255., 204./255.);

                    float SMOOTH(float r, float R)
                    {
                        return 1.0-smoothstep(R-1.0,R+1.0, r);
                    }

                    float RS(float a, float b, float x)
                    {
                        return smoothstep(a-1.0,a+1.0,x)*(1.0-smoothstep(b-1.0,b+1.0,x));
                    }

                    float movingLine(vec2 uv, vec2 center, float radius)
                    {
                        //angle of the line
                        float theta0 = 90.0 * time;
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        if(r<radius)
                        {
                            //compute the distance to the line theta=theta0
                            vec2 p = radius*vec2(cos(theta0*M_PI/180.0),
                                                -sin(theta0*M_PI/180.0));
                            float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
                            d = normalize(d);
                            //compute gradient based on angle difference to theta0
                            float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
                            float gradient = clamp(1.0-theta/90.0,0.0,1.0);
                            return SMOOTH(l,1.0)+0.5*gradient;
                        }
                        else return 0.0;
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
                        if( abs(d.y) > opening )
                            return SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius);
                        else
                            return 0.0;
                    }

                    float circle3(vec2 uv, vec2 center, float radius, float width)
                    {
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        d = normalize(d);
                        float theta = 180.0*(atan(d.y,d.x)/M_PI);
                        return smoothstep(2.0, 2.1, abs(mod(theta+2.0,45.0)-2.0)) *
                            mix( 0.5, 1.0, step(45.0, abs(mod(theta, 36.0)-90.0)) ) *
                            (SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius));
                    }

                    float triangles(vec2 uv, vec2 center, float radius)
                    {
                        vec2 d = uv - center;
                        return RS(-8.0, 0.0, d.x-radius) * (1.0-smoothstep( 7.0+d.x-radius,9.0+d.x-radius, abs(d.y)))
                            + RS( 0.0, 8.0, d.x+radius) * (1.0-smoothstep( 7.0-d.x-radius,9.0-d.x-radius, abs(d.y)))
                            + RS(-8.0, 0.0, d.y-radius) * (1.0-smoothstep( 7.0+d.y-radius,9.0+d.y-radius, abs(d.x)))
                            + RS( 0.0, 8.0, d.y+radius) * (1.0-smoothstep( 7.0-d.y-radius,9.0-d.y-radius, abs(d.x)));
                    }

                    float _cross(vec2 uv, vec2 center, float radius)
                    {
                        vec2 d = uv - center;
                        int x = int(d.x);
                        int y = int(d.y);
                        float r = sqrt( dot( d, d ) );
                        if( (r<radius) && ( (x==y) || (x==-y) ) )
                            return 1.0;
                        else return 0.0;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 640.;

                        vec3 finalColor; // 颜色
                        float alpha; // 透明度

                        vec2 c = vec2(640.) / 2.; // 中心

                        // float cross_result = _cross(uv, c, 240.0);
                        // finalColor = vec3(0.3 * cross_result);
                        // alpha = cross_result;

                        // 两个内圈
                        float circle_result_1 = circle(uv, c, 100.0, 2.0) + circle(uv, c, 165.0, 1.0);
                        finalColor += circle_result_1 * blue1;
                        alpha += circle_result_1;
                        // 白圈
                        // float circle_result_2 = circle(uv, c, 240.0, 4.0);
                        // finalColor += circle_result_2;
                        // alpha += circle_result_2;
                        // 最外圈
                        float circle3_result = circle3(uv, c, 262.0, 10.0);
                        finalColor += circle3_result * blue1;
                        alpha += circle3_result;
                        // 三角
                        // float triangles_result = triangles(uv, c, 315.0 + 30.0 * sin(time));
                        // finalColor += triangles_result * blue2;
                        // alpha += triangles_result;
                        // 扫描线
                        // float movingLine_result = movingLine(uv, c, 240.0);
                        // finalColor += movingLine_result * blue3;
                        // alpha += movingLine_result;
                        // 最内圈
                        // float circle_result_3 = circle(uv, c, 10.0, 2.0);
                        // finalColor += circle_result_3 * blue3;
                        // alpha += circle_result_3;
                        // 中间动态圈
                        float circle2_result = circle2(uv, c, 320.0, 5.0, 0.5+0.2*cos(time));
                        finalColor += 0.7 * circle2_result * blue3;
                        alpha += circle2_result;

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
</script>

<style lang="scss" scoped>
@import "./assets/style/ModelClip.scss";
</style>
