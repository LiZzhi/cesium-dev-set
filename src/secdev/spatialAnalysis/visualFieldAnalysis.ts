import { Cartesian3, Viewer, Color, Camera, ShadowMap, PostProcessStage, PerspectiveFrustum, Primitive, HeadingPitchRoll } from "cesium";
import visualField from "./visualField";
import uuid from "@/utils/uuid";

export type visualFieldOptionsType = {
    show: boolean;  // 是否显示
    size: number;   // 贴图尺寸
    distance: number;   // 可视域半径
    heading: number;    // 航向角,角度
    pitch: number;  // 倾斜角,角度
    horizontalAngle: number;    // 水平可视域角度
    verticalAngle: number;  // 垂直可视域角度
    visibleColor: Color;    // 可视区域颜色
    invisibleColor: Color;  // 不可视区域颜色
    softShadows: boolean;   // 是否启用柔和阴影
}

export default class visualFieldAnalysis{
    #viewer: Viewer;
    constructor(viewer: Viewer){
        this.#viewer = viewer;
    }

    create(position: Cartesian3, options: Partial<visualFieldOptionsType> = {}){
        const o: visualFieldOptionsType = Object.assign(this.defaultOpitons, options);
        const camera = this.#createLightCamera(this.#viewer, position, o);
        const shadowMap = this.#createShadowMap(this.#viewer, camera, o);
        const frustumOutline = this.#drawFrustumOutline(camera);
        const sketch = this.#drawSketch(camera, o);
        const postStage = this.#createPostStage(this.#viewer, camera, shadowMap, o);
        const visual = new visualField(this.#viewer, camera, postStage, shadowMap, frustumOutline, sketch);
        return visual;
    }

    remove(visual: visualField){
        visual.remove();
    }

    get defaultOpitons(): visualFieldOptionsType{
        return {
            show: true,
            size: 1024,
            distance: 100.0,
            heading: 0.0,
            pitch: 0.0,
            horizontalAngle: 60.0,
            verticalAngle: 30.0,
            visibleColor: Cesium.Color.GREEN,
            invisibleColor: Cesium.Color.RED,
            softShadows: true,
        }
    }

    #createLightCamera(viewer: Viewer, position: Cartesian3, options: visualFieldOptionsType): Camera{
        const { distance, horizontalAngle, verticalAngle, heading, pitch } = options;

        let camera = new Cesium.Camera(viewer.scene);
        camera.position = position;

        const hr = Cesium.Math.toRadians(horizontalAngle);
        const vr = Cesium.Math.toRadians(verticalAngle);
        let frustum = new Cesium.PerspectiveFrustum ({
            near: distance * 0.001,
            far: distance,
            aspectRatio: (distance * Math.tan(hr / 2) * 2) / (distance * Math.tan(vr / 2) * 2),
            fov: hr > vr ? hr : vr,
        });

        camera.frustum = frustum;

        camera.setView({
            destination: position,
            orientation: HeadingPitchRoll.fromDegrees(heading, pitch, 0.0)
        })

        return camera;
    }

    #createShadowMap(viewer:Viewer, camera: Camera, options: visualFieldOptionsType): ShadowMap {
        const { show, distance, size, softShadows } = options;

        return new Cesium.ShadowMap({
            // @ts-ignore
            context: viewer.scene.context,    // 此context并非 canvas.getContext，而是cesium封装的一个类
            lightCamera: camera,
            enabled: show,
            isPointLight: true,
            pointLightRadius: distance,
            cascadesEnabled: false,
            size: size,
            softShadows: softShadows,
            normalOffset: false,
            fromLightSource: false
        });
    }

    /**
     * @description: 渲染后处理方法，由于showMap私有变量过多，导致频繁的使用ts-ignore
     * @param {Viewer} viewer
     * @param {Camera} camera
     * @param {ShadowMap} shadowMap
     * @return {PostProcessStage}
     */
    #createPostStage(viewer:Viewer, camera:Camera, shadowMap: ShadowMap, options: visualFieldOptionsType): PostProcessStage{
        const { distance, visibleColor, invisibleColor } = options;
        const glsl = getGLSL();
        const scene = viewer.scene;
        return new Cesium.PostProcessStage({
            fragmentShader: glsl,
            uniforms: {
                shadowMap_textureCube: () => {
                    // @ts-ignore
                    shadowMap.update(Reflect.get(scene, '_frameState'));
                    return Reflect.get(shadowMap, '_shadowMapTexture');
                },
                shadowMap_matrix: () => {
                    // @ts-ignore
                    shadowMap.update(Reflect.get(scene, '_frameState'));
                    return Reflect.get(shadowMap, '_shadowMapMatrix');
                },
                shadowMap_lightPositionEC: () => {
                    // @ts-ignore
                    shadowMap.update(Reflect.get(scene, '_frameState'));
                    return Reflect.get(shadowMap, '_lightPositionEC');
                },
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                    // @ts-ignore
                    shadowMap.update(Reflect.get(scene, '_frameState'));
                    // @ts-ignore
                    const bias = shadowMap._pointBias;
                    return Cesium.Cartesian4.fromElements(
                        bias.normalOffsetScale,
                        // @ts-ignore
                        shadowMap._distance,
                        shadowMap.maximumDistance,
                        0.0,
                        new Cesium.Cartesian4()
                    );
                },
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                    // @ts-ignore
                    shadowMap.update(Reflect.get(scene, '_frameState'));
                    // @ts-ignore
                    const bias = shadowMap._pointBias;
                    const scratchTexelStepSize = new Cesium.Cartesian2();
                    const texelStepSize = scratchTexelStepSize;
                    // @ts-ignore
                    texelStepSize.x = 1.0 / shadowMap._textureSize.x;
                    // @ts-ignore
                    texelStepSize.y = 1.0 / shadowMap._textureSize.y;

                    return Cesium.Cartesian4.fromElements(
                        texelStepSize.x,
                        texelStepSize.y,
                        bias.depthBias,
                        bias.normalShadingSmooth,
                        new Cesium.Cartesian4()
                    );
                },
                camera_projection_matrix: camera.frustum.projectionMatrix,
                camera_view_matrix: camera.viewMatrix,
                helsing_viewDistance: () => {
                    return distance;
                },
                helsing_visibleAreaColor: visibleColor,
                helsing_invisibleAreaColor: invisibleColor
            }
        })
    }

    #drawFrustumOutline(camera:Camera): Primitive {
        const scratchRight = new Cesium.Cartesian3();
        const scratchRotation = new Cesium.Matrix3();
        const scratchOrientation = new Cesium.Quaternion();

        Cesium.Cartesian3.negate(camera.rightWC, scratchRight);
        Cesium.Matrix3.setColumn(scratchRotation, 0, scratchRight, scratchRotation);
        Cesium.Matrix3.setColumn(scratchRotation, 1, camera.upWC, scratchRotation);
        Cesium.Matrix3.setColumn(scratchRotation, 2, camera.directionWC, scratchRotation);
        Cesium.Quaternion.fromRotationMatrix(scratchRotation, scratchOrientation);

        let instance = new Cesium.GeometryInstance({
            geometry: new Cesium.FrustumOutlineGeometry({
                frustum: camera.frustum as PerspectiveFrustum,
                origin: camera.positionWC,
                orientation: scratchOrientation
            }),
            id: "VFA" + uuid(),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.YELLOWGREEN//new Cesium.Color(0.0, 1.0, 0.0, 1.0)
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true)
            }
        });

        return new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: false
            })
        })
    }

    #drawSketch(camera: Camera, options: visualFieldOptionsType){
        const { heading, pitch, distance, horizontalAngle, verticalAngle } = options;
        return new Cesium.Entity({
            name: 'sketch',
            position: camera.positionWC,
            orientation: new Cesium.ConstantProperty(
                Cesium.Transforms.headingPitchRollQuaternion(
                    camera.positionWC,
                    Cesium.HeadingPitchRoll.fromDegrees(heading - 90, pitch, 0.0)
                )
            ),
            ellipsoid: {
                radii: new Cesium.Cartesian3(distance, distance, distance), //椭球内部的半径
                innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
                minimumClock: Cesium.Math.toRadians(-horizontalAngle / 2), //椭圆形的最小时钟角度
                maximumClock: Cesium.Math.toRadians(horizontalAngle / 2), //椭球的最大时钟角度
                minimumCone: Cesium.Math.toRadians(90 - verticalAngle), //椭圆形的最小圆锥角
                maximumCone: Cesium.Math.toRadians(90 + verticalAngle), //椭球的最大圆锥角
                fill: false, //椭圆是否填充所提供的的材料
                outline: true, //是否勾勒出椭圆形
                subdivisions: 256, //每个轮廓环的样本数,确定曲率的粒度
                stackPartitions: 64, //堆栈数的属性
                slicePartitions: 64, //径向切片数量的属性
                outlineColor: Cesium.Color.YELLOWGREEN //轮廓的颜色
            }
        })
    }
}

function getGLSL(){
    return `
        #define USE_CUBE_MAP_SHADOW true
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 v_textureCoordinates;
        uniform mat4 camera_projection_matrix;
        uniform mat4 camera_view_matrix;
        uniform samplerCube shadowMap_textureCube;
        uniform mat4 shadowMap_matrix;
        uniform vec4 shadowMap_lightPositionEC;
        uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
        uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
        uniform float helsing_viewDistance;
        uniform vec4 helsing_visibleAreaColor;
        uniform vec4 helsing_invisibleAreaColor;

        struct zx_shadowParameters
        {
            vec3 texCoords;
            float depthBias;
            float depth;
            float nDotL;
            vec2 texelStepSize;
            float normalShadingSmooth;
            float darkness;
        };

        float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
        {
            float depthBias = shadowParameters.depthBias;
            float depth = shadowParameters.depth;
            float nDotL = shadowParameters.nDotL;
            float normalShadingSmooth = shadowParameters.normalShadingSmooth;
            float darkness = shadowParameters.darkness;
            vec3 uvw = shadowParameters.texCoords;
            depth -= depthBias;
            float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
            return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
        }
        vec4 getPositionEC(){
            return czm_windowToEyeCoordinates(gl_FragCoord);
        }
        vec3 getNormalEC(){
            return vec3(1.);
        }
        vec4 toEye(in vec2 uv,in float depth){
            vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
            vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
            posInCamera=posInCamera/posInCamera.w;
            return posInCamera;
        }
        vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
            vec3 v01=point-planeOrigin;
            float d=dot(planeNormal,v01);
            return(point-planeNormal*d);
        }
        float getDepth(in vec4 depth){
            float z_window=czm_unpackDepth(depth);
            z_window=czm_reverseLogDepth(z_window);
            float n_range=czm_depthRange.near;
            float f_range=czm_depthRange.far;
            return(2.*z_window-n_range-f_range)/(f_range-n_range);
        }
        float shadow(in vec4 positionEC){
            vec3 normalEC=getNormalEC();
            zx_shadowParameters shadowParameters;
            shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
            shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
            shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
            shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
            vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
            float distance=length(directionEC);
            directionEC=normalize(directionEC);
            float radius=shadowMap_lightPositionEC.w;
            if(distance>radius)
            {
                return 2.0;
            }
            vec3 directionWC=czm_inverseViewRotation*directionEC;
            shadowParameters.depth=distance/radius-0.0003;
            shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
            shadowParameters.texCoords=directionWC;
            float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
            return visibility;
        }
        bool visible(in vec4 result)
        {
            result.x/=result.w;
            result.y/=result.w;
            result.z/=result.w;
            return result.x>=-1.&&result.x<=1.
            &&result.y>=-1.&&result.y<=1.
            &&result.z>=-1.&&result.z<=1.;
        }
        void main(){
            // 釉色 = 结构二维(颜色纹理, 纹理坐标)
            gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
            // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
            // 视角 = (纹理坐标, 深度)
            vec4 viewPos = toEye(v_textureCoordinates, depth);
            // 世界坐标
            vec4 wordPos = czm_inverseView * viewPos;
            // 虚拟相机中坐标
            vec4 vcPos = camera_view_matrix * wordPos;
            float near = .001 * helsing_viewDistance;
            float dis = length(vcPos.xyz);
            if(dis > near && dis < helsing_viewDistance){
                // 透视投影
                vec4 posInEye = camera_projection_matrix * vcPos;
                // 可视区颜色
                // vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
                // vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
                if(visible(posInEye)){
                    float vis = shadow(viewPos);
                    if(vis > 0.3){
                        gl_FragColor = mix(gl_FragColor,helsing_visibleAreaColor,.5);
                    } else{
                        gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
                    }
                }
            }
        }
    `
}