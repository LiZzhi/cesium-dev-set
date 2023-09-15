/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-09-12 15:26:40
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-09-12 15:50:03
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\sky\groundSkyBox.ts
 * @Description: 近景天空盒
 */
import { SkyBox } from "cesium";

export default class groundSkyBox extends SkyBox{
    constructor(options: {
        sources?: any;
        show?: boolean;
    }){
        super(options);
    }

    // @ts-ignore
    update(frameState: any, useHdr: any): void {
        // cesium类型有问题，原本就是有参数的，故此处忽略掉
        // 此方法只改了一个顶点着色器，主要是添加一个旋转矩阵，使近景时能看见天空盒
        // 顶点着色器有修改，主要是乘了一个旋转矩阵
        const SkyBoxVS = `
            attribute vec3 position;
            varying vec3 v_texCoord;
            uniform mat3 u_rotateMatrix;
            void main(){
                vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
                gl_Position = czm_projection * vec4(p, 1.0);
                v_texCoord = position.xyz;
            }
        `
        //片元着色器，直接从源码复制
        const SkyBoxFS =`
            uniform samplerCube u_cubeMap;
            varying vec3 v_texCoord;
            void main(){
                vec4 color = textureCube(u_cubeMap, normalize(v_texCoord));
                gl_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
            }
        `
        const that = this;

        if (!this.show) {
            return undefined;
        }

        if (
            frameState.mode !== Cesium.SceneMode.SCENE3D &&
            frameState.mode !== Cesium.SceneMode.MORPHING
        ) {
            return undefined;
        }

        if (!frameState.passes.render) {
            return undefined;
        }

        const context = frameState.context;

        // @ts-ignore
        if (this._sources !== this.sources) {
            // @ts-ignore
            this._sources = this.sources;
            const sources = this.sources;

            if (!Cesium.defined(sources.positiveX) ||
                !Cesium.defined(sources.negativeX) ||
                !Cesium.defined(sources.positiveY) ||
                !Cesium.defined(sources.negativeY) ||
                !Cesium.defined(sources.positiveZ) ||
                !Cesium.defined(sources.negativeZ)
            ) {
                throw new Cesium.DeveloperError(
                    'this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.'
                );
            }

            if (
                typeof sources.positiveX !== typeof sources.negativeX ||
                typeof sources.positiveX !== typeof sources.positiveY ||
                typeof sources.positiveX !== typeof sources.negativeY ||
                typeof sources.positiveX !== typeof sources.positiveZ ||
                typeof sources.positiveX !== typeof sources.negativeZ
            ) {
                throw new Cesium.DeveloperError(
                    'this.sources properties must all be the same type.'
                );
            }

            if (typeof sources.positiveX === 'string') {
                // Given urls for cube-map images.  Load them.
                // @ts-ignore
                Cesium.loadCubeMap(context, this._sources).then(function (cubeMap: any) {
                    // @ts-ignore
                    that._cubeMap = that._cubeMap && that._cubeMap.destroy();
                    // @ts-ignore
                    that._cubeMap = cubeMap;
                });
            } else {
                // @ts-ignore
                this._cubeMap = this._cubeMap && this._cubeMap.destroy();
                // @ts-ignore
                this._cubeMap = new Cesium.CubeMap({
                    context: context,
                    source: sources
                });
            }
        }
        // @ts-ignore
        const command = this._command;

        command.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            frameState.camera._positionWC
        );
        if (!Cesium.defined(command.vertexArray)) {
            command.uniformMap = {
                u_cubeMap: function () {
                    // @ts-ignore
                    return that._cubeMap;
                },
                u_rotateMatrix: function () {
                    return Cesium.Matrix4.getMatrix3(command.modelMatrix, new Cesium.Matrix3());
                }
            };

            const geometry = Cesium.BoxGeometry.createGeometry(
                Cesium.BoxGeometry.fromDimensions({
                    dimensions: new Cesium.Cartesian3(2.0, 2.0, 2.0),
                    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
                })
            );
            // @ts-ignore
            const attributeLocations = (this._attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(
                geometry!
            ));
            // @ts-ignore
            command.vertexArray = Cesium.VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                // @ts-ignore
                bufferUsage: Cesium.BufferUsage._DRAW
            });
            // @ts-ignore
            command.renderState = Cesium.RenderState.fromCache({
                blending: Cesium.BlendingState.ALPHA_BLEND
            });
        }

        // @ts-ignore
        if (!Cesium.defined(command.shaderProgram) || this._useHdr !== useHdr) {
            // @ts-ignore
            const fs = new Cesium.ShaderSource({
                defines: [useHdr ? 'HDR' : ''],
                sources: [SkyBoxFS]
            });
            // @ts-ignore
            command.shaderProgram = Cesium.ShaderProgram.fromCache({
                context: context,
                vertexShaderSource: SkyBoxVS,
                fragmentShaderSource: fs,
                // @ts-ignore
                attributeLocations: this._attributeLocations
            });
            // @ts-ignore
            this._useHdr = useHdr;
        }

        // @ts-ignore
        if (!Cesium.defined(this._cubeMap)) {
            return undefined;
        }

        return command;
    }
}
