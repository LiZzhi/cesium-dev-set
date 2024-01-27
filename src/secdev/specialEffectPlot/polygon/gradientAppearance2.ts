export default function gradientAppearance() {
    return new Cesium.Appearance({
        renderState: {
            blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND, //混合
            depthTest: { enabled: true }, //深度测试
            depthMask: true,
        },
        fragmentShaderSource: fragmentShaderSource(),
        vertexShaderSource: vertexShaderSource(),
    });
}

function vertexShaderSource() {
    return `
        in vec3 position3DHigh;
        in vec3 position3DLow;
        in vec4 color;
        out vec4 v_color;
        in float batchId;
        void main() {
            vec4 p = czm_computePosition();
            v_color =color;
            p = czm_modelViewProjectionRelativeToEye * p;
            gl_Position=p;
            gl_PointSize=20.0;
        }
    `;
}

function fragmentShaderSource() {
    return `
        out vec4 v_color;
        void main() {
            float d = distance(gl_PointCoord, vec2(0.5,0.5));
            if(d < 0.5){
                gl_FragColor = v_color;
            }else{
                discard;
            }
        }
    `;
}
