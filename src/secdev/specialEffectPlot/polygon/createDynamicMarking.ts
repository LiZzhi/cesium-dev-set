import cartographicTool from "@/secdev/utils/cartographicTool";
import { Cartesian3, Color, Viewer } from "cesium";

export type dynamicMarkOptionType = {
    color: Color; // 颜色
    coneHeight: number; // 圆锥高度
    speed: number; // 速度
    height: number; // 底高
};

export default function (
    viewer: Viewer,
    center: Cartesian3,
    radius: number,
    option: Partial<dynamicMarkOptionType> = {}
) {
    let o = defaultOptions(radius);
    o = Object.assign(o, option);
    const collection = new Cesium.PrimitiveCollection({
        destroyPrimitives: false,
    });
    const p1 = addBackCircle(center, radius, o);
    const p2 = addCone(viewer, center, radius, o);
    const p3 = addDynamicCircle(viewer, center, radius, o);
    const p4 = addDynamicRipple(viewer, center, radius, o);
    collection.add(p1);
    collection.add(p2.primitive);
    collection.add(p3.primitive);
    collection.add(p4.primitive);

    function removeUpdate() {
        p2.removeUpdate();
        p3.removeUpdate();
        p4.removeUpdate();
    }
    return { dynamicMark: collection, removeUpdate };
}

function addBackCircle(
    center: Cartesian3,
    radius: number,
    option: dynamicMarkOptionType
) {
    const img = require("../../assets/img/dynamicMarking/backCircle.png");
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
        appearance: circleMaterial(img, option),
    });

    return primitive;
}

function addCone(
    viewer: Viewer,
    center: Cartesian3,
    radius: number,
    option: dynamicMarkOptionType
) {
    let radin = Cesium.Cartographic.fromCartesian(center);
    let p = Cesium.Cartesian3.fromRadians(
        radin.longitude,
        radin.latitude,
        option.height + option.coneHeight / 2
    );
    let { material, removeUpdate } = coneMaterial(viewer, option);
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.CylinderGeometry({
                topRadius: 0.01,
                bottomRadius: radius / 4,
                length: option.coneHeight,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(p),
        }),
        appearance: material,
    });

    return { primitive, removeUpdate };
}

function coneMaterial(viewer: Viewer, option: dynamicMarkOptionType) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: option.color,
                    time: 0,
                },
                source: `
                    uniform vec4 color;
                    uniform float time;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = -1. + 2. * materialInput.st;

                        float a = length(st);
                        material.diffuse = color.rgb;
                        material.alpha = a * color.a * (1. - fract(time));
                        return material;
                    }
                `,
            },
        }),
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds =
            ((performance.now() - startTime) / 1000) * option.speed;
        m.material.uniforms = {
            color: option.color,
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

function addDynamicCircle(
    viewer: Viewer,
    center: Cartesian3,
    radius: number,
    option: dynamicMarkOptionType
) {
    const img = require("../../assets/img/dynamicMarking/dynamicCircle.png");
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
        appearance: circleMaterial(img, option),
        asynchronous: false,
    });
    let radian = Cesium.Cartographic.fromCartesian(center);
    let c = Cesium.Cartesian3.fromRadians(
        radian.longitude,
        radian.latitude,
        option.height
    );

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds =
            ((performance.now() - startTime) / 1000) * option.speed;
        const scale =
            (elapsedTimeSeconds - Math.floor(elapsedTimeSeconds)) * 0.75 + 0.25;

        let localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(c);
        let worldToLocal_Matrix = Cesium.Matrix4.inverse(
            localToWorld_Matrix,
            new Cesium.Matrix4()
        );

        let scaleMatrix = Cesium.Matrix4.fromScale(
            new Cesium.Cartesian3(scale, scale, 1)
        );

        let localScaleMatrix = Cesium.Matrix4.multiply(
            scaleMatrix,
            worldToLocal_Matrix,
            new Cesium.Matrix4()
        );
        let worldMatrix = Cesium.Matrix4.multiply(
            localToWorld_Matrix,
            localScaleMatrix,
            new Cesium.Matrix4()
        );

        primitive.modelMatrix = worldMatrix;
    }
    viewer.scene.preRender.addEventListener(update);
    function removeUpdate() {
        viewer.scene.preRender.removeEventListener(update);
    }

    return { primitive, removeUpdate };
}

function addDynamicRipple(
    viewer: Viewer,
    center: Cartesian3,
    radius: number,
    option: dynamicMarkOptionType
) {
    const img = require("../../assets/img/dynamicMarking/dynamicRipple.png");
    const degrees = cartographicTool.formCartesian3(center, false);
    const circleJson = turf.circle(degrees, radius / 4000);
    const ps = cartographicTool.toCartesian3S(
        circleJson.geometry.coordinates[0]
    );
    let primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: ps,
                minimumHeights: ps.map(() => option.height),
                maximumHeights: ps.map(() => option.height + option.coneHeight),
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: circleMaterial(img, option),
        asynchronous: false,
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds =
            ((performance.now() - startTime) / 1000) * option.speed;
        const radian =
            (elapsedTimeSeconds - Math.floor(elapsedTimeSeconds)) * Math.PI;

        let localToWorld_Matrix =
            Cesium.Transforms.eastNorthUpToFixedFrame(center);
        let worldToLocal_Matrix = Cesium.Matrix4.inverse(
            localToWorld_Matrix,
            new Cesium.Matrix4()
        );

        let rotationZ = Cesium.Matrix3.fromRotationZ(radian);
        let rotationMatrix = Cesium.Matrix4.fromRotation(rotationZ);

        let localRotationMatrix = Cesium.Matrix4.multiply(
            rotationMatrix,
            worldToLocal_Matrix,
            new Cesium.Matrix4()
        );
        let worldMatrix = Cesium.Matrix4.multiply(
            localToWorld_Matrix,
            localRotationMatrix,
            new Cesium.Matrix4()
        );

        primitive.modelMatrix = worldMatrix;
    }
    viewer.scene.preRender.addEventListener(update);
    function removeUpdate() {
        viewer.scene.preRender.removeEventListener(update);
    }

    return { primitive, removeUpdate };
}

function circleMaterial(img: string, option: dynamicMarkOptionType) {
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    color: option.color,
                    image: img,
                },
                source: `
                    uniform vec4 color;
                    uniform sampler2D image;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        vec4 colorImage = texture2D(image, st);

                        material.diffuse = color.rgb;
                        material.alpha = colorImage.a;
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
        color: Cesium.Color.AQUA,
        coneHeight: radius * 1.5,
        speed: 1.0,
        height: 0.0,
    };
}
