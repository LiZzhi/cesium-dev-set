import { Color, PolygonHierarchy } from "cesium";

export default function waterEffect(
    hierarchy: PolygonHierarchy,
) {
    const polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: hierarchy,
        perPositionHeight: true,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });

    let appearance = new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
            fabric: {
                type: "Water",
                uniforms: {
                    reflectivity: 0,
                    color: new Cesium.Color(0.117647, 0.564706, 1, 0.7),
                },
            },
        }),
        vertexShaderSource: VS(),
        fragmentShaderSource: FS(),
        aboveGround: false,
    });

    const primitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: polygon,
        }),
        appearance: appearance,
        classificationType: Cesium.ClassificationType.TERRAIN,
        show: true,
    });
    return { primitive };
}

function VS() {
    return /* glsl */ `
        attribute vec3 position;
        attribute vec2 st;
        uniform mat4 u_modelViewMatrix;
        uniform mat4 u_invWorldViewMatrix;
        uniform int u_clampToGroud;
        uniform vec3 u_camPos;
        uniform vec3 u_scale;
        varying vec3 vToEye;
        varying vec2 vUv;
        varying vec4 vCoord;
        void main() {
            vec4 positionW = u_modelViewMatrix * vec4(position.xyz, 1.0);
            vec4 eyep = czm_modelView * positionW;
            gl_Position = czm_projection * eyep;
            if (u_clampToGroud == 1) {
                vToEye = (u_camPos - position.xyz) * u_scale;
            } else {
                vec4 pos = u_modelViewMatrix * vec4(position.xyz,1.0);
                vToEye = vec3(u_invWorldViewMatrix*vec4(pos.xyz,0.0));
                vCoord = gl_Position;
            }
            vUv = st;
        }
    `;
}

function FS() {
    return /* glsl */ `
        uniform sampler2D tRefractionMap;
        uniform sampler2D tNormalMap0;
        uniform sampler2D tNormalMap1;
        uniform sampler2D tFlowMap;
        uniform vec3 color;
        uniform float reflectivity;
        uniform vec4 config;
        varying vec4 vCoord;
        varying vec2 vUv;
        varying vec3 vToEye;

        void main() {
            float flowMapOffset0 = config.x;
            float flowMapOffset1 = config.y;
            float halfCycle = config.z;
            float scale = config.w;
            vec3 toEye = normalize( vToEye );
            vec2 flow;
            #ifdef USE_FLOWMAP
                flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;
                flow = texture2D( tFlowMap, vUv ).rg;
            #else
                flow = flowDirection;
            #endif
            flow.x *= - 1.0;
            vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );
            vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );
            float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;
            vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );
            vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
            float theta = max( dot( toEye, normal ), 0.0 );
            float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );
            vec3 coord = vCoord.xyz / vCoord.w;
            vec2 coord1 = gl_FragCoord.xy / czm_viewport.zw;
            vec2 uv = coord1.xy + coord.z * normal.xz * 0.05;
            vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
            vec4 refractColor = texture2D( tRefractionMap, uv );
            gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );
            gl_FragColor = refractColor;
        }
    `;
}
