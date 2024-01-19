import flightPositions, { flightOptionType } from "./flightPath";

/**
 * @description: 生成飞线
 * @param {number[]} start 起点, [lon, lat]
 * @param {number[]} end 终点, [lon, lat]
 * @param {flightOptionType} options 配置项
 * @return {*}
 */
export default function createFlightLine(
    start: number[],
    end: number[],
    options: Partial<flightOptionType> = {}
) {
    let positions = flightPositions(start, end, options);
    let collection = new Cesium.PrimitiveCollection();
    let flowingLineMaterial = new Cesium.Material({
        fabric: {
            type: "FlowingLineMaterial",
            uniforms: {
                color: new Cesium.Color(0.0, 1.0, 1.0, 0.5), // light color
                speed: 1.5, // flowing speed, speed > 0.0
                headsize: 0.05, // 0.0 < headsize < 1.0
                tailsize: 0.5, // 0.0 < tailsize < 1.0
                widthoffset: 0.1, // 0.0 < widthoffset < 1.0
                coresize: 0.05, // 0.0 < coresize < 1.0
            },
            source: getGLSL(),
        },
    });

    let flight = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 20.0,
                vertexFormat: Cesium.VertexFormat.ALL,
            }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
            material: flowingLineMaterial,
        }),
    });
    let line = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 2.0,
                vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            }),
            attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.3))
            }
        }),
        appearance : new Cesium.PolylineColorAppearance()
    });
    collection.add(flight);
    collection.add(line);
    return collection;
}

function getGLSL() {
    return `
        float SPEED_STEP = 0.01;
        vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset) {
            float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x);
            float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y);
            return vec4(lineLength * lineWidth);
        }
        czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material m = czm_getDefaultMaterial(materialInput);
            float sinTime = sin(czm_frameNumber * SPEED_STEP * speed);
            vec4 v4_core;
            vec4 v4_color;
            float xPos = 0.0;
            if (sinTime < 0.0){
                xPos = cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize;
            } else {
                xPos = -cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize;
            }
            v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);
            v4_core = drawLight(xPos, materialInput.st, coresize, coresize*2.0, widthoffset*2.0);
            m.diffuse = color.xyz + v4_core.xyz*v4_core.w*0.8;
            m.alpha = pow(v4_color.w, 3.0);
            return m;
        }
    `;
}
