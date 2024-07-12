const _shadersSeparableBlur =
    "\n\
varying vec2 v_textureCoordinates;\n\
uniform sampler2D colorTexture;\n\
uniform vec2 colorTextureDimensions;\n\
uniform vec2 direction;\n\
uniform float kernelRadius;\n\
\n\
float gaussianPdf(in float x, in float sigma) {\n\
    return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\
}\n\
void main() {\
    vec2 vUv=v_textureCoordinates;\n\
    vec2 invSize = 1.0 / colorTextureDimensions;\
    float weightSum = gaussianPdf(0.0, kernelRadius);\
    vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\
    vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\
    vec2 uvOffset = delta;\
    for( int i = 1; i <= MAX_RADIUS; i ++ ) {\
        float w = gaussianPdf(uvOffset.x, kernelRadius);\
        vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\
        vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\
        diffuseSum += ((sample1 + sample2) * w);\
        weightSum += (2.0 * w);\
        uvOffset += delta;\
    }\
    gl_FragColor = diffuseSum/weightSum;\
}";

function parseDefines(shader) {
    let defines = [];
    for (const key in shader.defines) {
        if (shader.defines.hasOwnProperty(key)) {
            const val = shader.defines[key];
            defines.push("#define " + key + " " + val);
        }
    }
    defines = defines.join("\n") + "\n";
    if (shader.fragmentShader) {
        shader.fragmentShader = defines + shader.fragmentShader;
    }
    if (shader.vertexShader) {
        shader.vertexShader = defines + shader.vertexShader;
    }
    return shader;
}

/**
 *
 * @param {string} name
 * @param {number} maxRadius
 * @param {number} kernelRadius
 * @param {number} textureScale
 * @returns {Cesium.PostProcessStageComposite}
 */
export default function createBlurStage(
    name,
    maxRadius,
    kernelRadius,
    textureScale
) {
    const {
        Cartesian2,
        PostProcessStage,
        PostProcessStageComposite,
        PostProcessStageSampleMode,
    } = Cesium;

    let blurDirectionX = new Cartesian2(1.0, 0.0);
    let blurDirectionY = new Cartesian2(0.0, 1.0);

    let separableBlurShader = {
        defines: {
            MAX_RADIUS: maxRadius,
        },
        fragmentShader: _shadersSeparableBlur,
    };
    parseDefines(separableBlurShader);

    let blurX = new PostProcessStage({
        name: name + "_x_direction",
        fragmentShader: separableBlurShader.fragmentShader,
        textureScale: textureScale,
        forcePowerOfTwo: true,
        uniforms: {
            kernelRadius: kernelRadius,
            direction: blurDirectionX,
        },
        sampleMode: PostProcessStageSampleMode.LINEAR,
    });

    let blurY = new PostProcessStage({
        name: name + "_y_direction",
        fragmentShader: separableBlurShader.fragmentShader,
        textureScale: textureScale,
        forcePowerOfTwo: true,
        uniforms: {
            kernelRadius: kernelRadius,
            direction: blurDirectionY,
        },
        sampleMode: PostProcessStageSampleMode.LINEAR,
    });

    let separableBlur = new PostProcessStageComposite({
        name: name,
        stages: [blurX, blurY],
        inputPreviousStageTexture: true,
    });
    return separableBlur;
}
