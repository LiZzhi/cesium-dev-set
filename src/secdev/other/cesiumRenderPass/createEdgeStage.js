import CesiumRenderPass from "./CesiumRenderPass.js";
import createBlurStage from "./createBlurStage.js";

export default function createEdgeStage(name) {
    name = name || "OutlineEffect";

    const {
        PostProcessStage,
        PostProcessStageComposite,
        defined,
        Sampler,
        TextureMagnificationFilter,
        TextureMinificationFilter,
    } = Cesium;

    let outlineWidth = 2,
        thresholdAngle = (12 * Math.PI) / 180,
        useSingleColor = false,
        showOutlineOnly = false,
        visibleEdgeColor = Cesium.Color.WHITE.clone(),
        hiddenEdgeColor = Cesium.Color.DARKRED.clone(),
        //
        showGlow = false,
        edgeGlow = 1,
        edgeStrength = 3,
        edgeOnly = false;

    let normalDepthPass = new CesiumRenderPass({
        name: name + "Pass",
        vertexShader: `
        varying vec3 vOutlineNormal;
        void main(){
            #ifdef HAS_NORMAL
                vOutlineNormal = normal;
            #else
                #ifdef HAS_V_NORMAL
                    vOutlineNormal = v_normal;
                #else
                    vOutlineNormal=vec3(0.);
                #endif
            #endif
        }
        `,
        fragmentShader: `
        varying vec3 vOutlineNormal;
        void main(){
            if(!czm_selected())discard; 
            if(length(vOutlineNormal)>0.)gl_FragColor=vec4( vOutlineNormal ,gl_FragColor.a); 
        }
        `,
        sampler: new Sampler({
            minificationFilter: TextureMinificationFilter.LINEAR,
            magnificationFilter: TextureMagnificationFilter.LINEAR,
        }),
    });

    const maskStage = new PostProcessStage({
        name: name + "Mask",
        uniforms: {
            outlineWidth() {
                return outlineWidth;
            },
            devicePixelRatio: devicePixelRatio,
            thresholdAngle: function () {
                return thresholdAngle;
            },
            useSingleColor: function () {
                return useSingleColor;
            },
            showOutlineOnly: function () {
                return showOutlineOnly;
            },
            visibleEdgeColor: function () {
                return visibleEdgeColor;
            },
            hiddenEdgeColor: function () {
                return hiddenEdgeColor;
            },
            maskTexture() {
                return normalDepthPass.texture;
            },
            maskDepthTexture() {
                return normalDepthPass.depthTexture;
            },
        },
        fragmentShader: `
        uniform sampler2D colorTexture;
        uniform vec2 colorTextureDimensions;
        uniform sampler2D depthTexture;

        uniform sampler2D maskTexture;
        uniform sampler2D maskDepthTexture;
        uniform float thresholdAngle;
        uniform bool showOutlineOnly;
         
        uniform float outlineWidth;
        uniform float devicePixelRatio;
        uniform vec3 visibleEdgeColor;
        uniform vec3 hiddenEdgeColor;
        uniform bool useSingleColor;

        varying vec2 v_textureCoordinates;
  
        float lengthSq(vec3 v){
            return v.x * v.x + v.y * v.y + v.z * v.z;
        }
        float normal_angleTo(vec3 a,vec3 b){
            float denominator =  sqrt(  lengthSq(a) * lengthSq(b) );
            if ( denominator == 0. ) return czm_pi / 2.;
            float theta = dot(a, b ) / denominator;
            // clamp, to handle numerical problems
            return  acos(  clamp( theta, - 1., 1. ) );
        }

        float compareNormal(vec4 n1,vec4 n2){
              if(  abs (  normal_angleTo( n1.xyz , n2.xyz ) ) < thresholdAngle ){
                  return 0.;
              }else{
                  return 1.;
              }
        }
 
        float compareDepth(const in vec2 uv){
            float maskDepth = czm_readDepth( maskDepthTexture, uv);
            float nonDepth = czm_readDepth( depthTexture, uv);
            return maskDepth>nonDepth?1.:0.;
        }

        void main(){

            vec2 vUv=v_textureCoordinates;

            // vec4 color = texture2D( colorTexture, vUv); 
            vec4 maskColor = texture2D( maskTexture, vUv);
             
            if( maskColor.a < 0.0001){
                // gl_FragColor =color;
                discard;
                return;
            }

            vec2 invSize = outlineWidth / colorTextureDimensions;
            vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
 
            vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
            vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
            vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
            vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
            
            float d;
            if(showOutlineOnly){
                float diff1 = (c1.a - c2.a)*0.5;
                float diff2 = (c3.a - c4.a)*0.5;
                d = length( vec2(diff1, diff2) );
            }
            else{ 
                float diff1 = compareNormal(c1,c2)*0.5;
                float diff2 = compareNormal(c3,c4)*0.5;
                d = length( vec2(diff1, diff2) );
            }
                    
            if(useSingleColor==false){
                float dp1 = compareDepth( vUv + uvOffset.xy);
                float dp2 = compareDepth( vUv - uvOffset.xy);
                float dp3 = compareDepth( vUv + uvOffset.yw);
                float dp4 = compareDepth( vUv - uvOffset.yw);
            
                float a1 = min(dp1, dp2);
                float a2 = min(dp3, dp4);
                float visibilityFactor = min(a1, a2);
                vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
            
                // gl_FragColor =color+ vec4( edgeColor , 1. ) * vec4(d);
                gl_FragColor = vec4( edgeColor , 1. ) * vec4(d);
            }else{
                // gl_FragColor =color+ vec4( visibleEdgeColor , 1. ) * vec4(d);
                gl_FragColor =  vec4( visibleEdgeColor , 1. ) * vec4(d);
            }
        }
        `,
    });
    normalDepthPass.stage = maskStage;

    const blurStage1 = createBlurStage(name + "Blur1", 4, 1, 0.75);
    const blurStage2 = createBlurStage(name + "Blur2", 4, 4, 0.5);

    const blurCompositeStage = new PostProcessStageComposite({
        name: name + "BlurComposite",
        stages: [maskStage, blurStage1, blurStage2],
        inputPreviousStageTexture: true,
    });

    const addStage = new PostProcessStage({
        name: name + "Additive",
        uniforms: {
            showGlow: function () {
                return showGlow;
            },
            edgeGlow: function () {
                return edgeGlow;
            },
            edgeStrength: function () {
                return edgeStrength;
            },
            edgeOnly() {
                return edgeOnly;
            },
            maskTexture() {
                return normalDepthPass.texture;
            },
            lineTexture: maskStage.name,
            edgeTexture1: blurStage1.name,
            edgeTexture2: blurCompositeStage.name,
        },
        fragmentShader: `
        uniform sampler2D colorTexture;
        uniform sampler2D edgeTexture1;
        uniform sampler2D edgeTexture2;
        uniform sampler2D lineTexture;
        uniform sampler2D maskTexture;
        uniform bool showGlow;
        uniform float edgeGlow;
        uniform bool edgeOnly;
        uniform float edgeStrength;

        varying vec2 v_textureCoordinates;
        void main(){
            
            vec2 vUv =v_textureCoordinates;
            vec4 edgeColor=texture2D( lineTexture, vUv);
            vec4 color=texture2D( colorTexture, vUv);
            float opacity=1.;
            if(edgeOnly){
                vec4 maskColor=texture2D( maskTexture, vUv);
                opacity=1.-maskColor.a;
                gl_FragColor = maskColor;
                return;
            }
  
            if(showGlow){
                float visFactor= czm_selected()?1.:0.;
                vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
                vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
                vec4 glowColor = edgeValue1 + edgeValue2 * edgeGlow;
                gl_FragColor = opacity * color + edgeColor + edgeStrength * (1. - edgeColor.r) * glowColor;
            }
            else{
                gl_FragColor = opacity * color + edgeColor;
            }
        }
        `,
    });

    const compositeStage = new PostProcessStageComposite({
        name: name + "Composite",
        stages: [blurCompositeStage, addStage],
        inputPreviousStageTexture: false,
    });

    function defUniforms(obj) {
        Object.defineProperties(obj, {
            showGlow: {
                get() {
                    return showGlow;
                },
                set(val) {
                    showGlow = val;
                },
            },
            edgeGlow: {
                get() {
                    return edgeGlow;
                },
                set(val) {
                    edgeGlow = val;
                },
            },
            edgeStrength: {
                get() {
                    return edgeStrength;
                },
                set(val) {
                    edgeStrength = val;
                },
            },
            thresholdAngle: {
                get() {
                    return thresholdAngle;
                },
                set(val) {
                    thresholdAngle = val;
                },
            },
            showOutlineOnly: {
                get() {
                    return showOutlineOnly;
                },
                set(val) {
                    showOutlineOnly = val;
                },
            },
            edgeOnly: {
                get() {
                    return edgeOnly;
                },
                set(val) {
                    edgeOnly = val;
                },
            },
            useSingleColor: {
                get() {
                    return useSingleColor;
                },
                set(val) {
                    useSingleColor = val;
                },
            },
            outlineWidth: {
                get() {
                    return outlineWidth;
                },
                set(val) {
                    outlineWidth = val;
                },
            },
            visibleEdgeColor: {
                get() {
                    return visibleEdgeColor;
                },
                set(val) {
                    visibleEdgeColor = val;
                },
            },
            hiddenEdgeColor: {
                get() {
                    return hiddenEdgeColor;
                },
                set(val) {
                    hiddenEdgeColor = val;
                },
            },
        });
    }

    defUniforms(compositeStage);
    compositeStage._uniforms = compositeStage._uniforms || {};
    defUniforms(compositeStage._uniforms);

    return compositeStage;
}
