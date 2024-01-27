import { Color, PolygonHierarchy } from "cesium";

export type waterOptionType = {
    baseWaterColor?: Color,  // 水颜色
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
                    uniforms: { ...options, },
                    source: getGLSL(),
                }
            }),
            aboveGround: false,
        }),
        show: true,
    });
    return { primitive, options }
}

function defaultOptions():waterOptionType {
    return {
        frequency: 10000.0,
        animationSpeed: 0.01,
        amplitude: 1.0,
    }
}

function getGLSL(alpha = 0.85) {
    return `
        out vec3 v_positionMC;
        out vec3 v_positionEC;
        out vec2 v_st;
        out vec4 fragColor;
        void main() {
            czm_materialInput materialInput;
            vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));
            #ifdef FACE_FORWARD
            normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
            #endif
            materialInput.s = v_st.s;
            materialInput.st = v_st;
            materialInput.str = vec3(v_st, 0.0);
            materialInput.normalEC = normalEC;
            materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);
            vec3 positionToEyeEC = -v_positionEC;
            materialInput.positionToEyeEC = positionToEyeEC;
            czm_material material = czm_getMaterial(materialInput);
            #ifdef FLAT
            fragColor = vec4(material.diffuse + material.emission, material.alpha);
            #else
            fragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
            fragColor.a=${alpha};
            #endif
        }
    `
}