/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-22 09:54:39
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-22 11:13:02
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\particle\radarScanLine.ts
 * @Description: 雷达扫描线, 必须开启深度检测, 不然位置不正确
 */
import { Cartesian3, Color, Viewer, PostProcessStage } from "cesium";

export default class radarScanLine {
    #viewer: Viewer;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
    }

    /**
     * @description: 创建, 必须开启深度检测
     * @param {Cartesian3} center 扫描中心
     * @param {number} radius 半径 米
     * @param {Color} scanColor 扫描颜色
     * @param {number} duration 持续时间 毫秒
     * @return {PostProcessStage} 扫描线
     */
    create(center: Cartesian3, radius: number, scanColor: Color, duration: number){
        let postProcess = this.#createPostProcess(center, radius, scanColor, duration);
        this.#viewer.scene.postProcessStages.add(postProcess);
        return postProcess
    }

    /**
     * @description: 移除
     * @param {PostProcessStage} postProcess 创建的扫描线
     * @return {*}
     */
    remove(postProcess: PostProcessStage){
        this.#viewer.scene.postProcessStages.remove(postProcess);
    }

    #createPostProcess(center: Cartesian3, radius: number, scanColor: Color, duration: number) {
        let cartographicCenter = Cesium.Cartographic.fromCartesian(center);

        let cartesian4Center = new Cesium.Cartesian4(center.x, center.y, center.z, 1);

        let cartographicCenter1 = new Cesium.Cartographic(
            cartographicCenter.longitude,
            cartographicCenter.latitude,
            cartographicCenter.height + 500
        );
        let cartesian3Center1 = Cesium.Cartographic.toCartesian(cartographicCenter1);
        let cartesian4Center1 = new Cesium.Cartesian4(
            cartesian3Center1.x,
            cartesian3Center1.y,
            cartesian3Center1.z,
            1
        );

        let cartographicCenter2 = new Cesium.Cartographic(
            cartographicCenter.longitude + Cesium.Math.toRadians(0.001),
            cartographicCenter.latitude,
            cartographicCenter.height
        );
        let cartesian3Center2 = Cesium.Cartographic.toCartesian(cartographicCenter2);
        let cartesian4Center2 = new Cesium.Cartesian4(
            cartesian3Center2.x,
            cartesian3Center2.y,
            cartesian3Center2.z,
            1
        );
        let rotateQ = new Cesium.Quaternion();
        let rotateM = new Cesium.Matrix3();

        let time = Date.now();

        let scratchCartesian4Center = new Cesium.Cartesian4();
        let scratchCartesian4Center1 = new Cesium.Cartesian4();
        let scratchCartesian4Center2 = new Cesium.Cartesian4();
        let scratchCartesian3Normal = new Cesium.Cartesian3();
        let scratchCartesian3Normal1 = new Cesium.Cartesian3();

        return new Cesium.PostProcessStage({
            fragmentShader: this.source,
            uniforms: {
                u_scanCenterEC: ()=>{
                    return Cesium.Matrix4.multiplyByVector(
                        this.#viewer.camera.viewMatrix,
                        cartesian4Center,
                        scratchCartesian4Center
                    );
                },
                u_scanPlaneNormalEC: ()=>{
                    let temp = Cesium.Matrix4.multiplyByVector(
                        this.#viewer.camera.viewMatrix,
                        cartesian4Center,
                        scratchCartesian4Center
                    );
                    let temp1 = Cesium.Matrix4.multiplyByVector(
                        viewer.camera.viewMatrix,
                        cartesian4Center1,
                        scratchCartesian4Center1
                    );
                    scratchCartesian3Normal.x = temp1.x - temp.x;
                    scratchCartesian3Normal.y = temp1.y - temp.y;
                    scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(
                        scratchCartesian3Normal,
                        scratchCartesian3Normal
                    );
                    return scratchCartesian3Normal;
                },
                u_radius: radius,
                u_scanLineNormalEC: function () {
                    let temp = Cesium.Matrix4.multiplyByVector(
                        viewer.camera.viewMatrix,
                        cartesian4Center,
                        scratchCartesian4Center
                    );
                    let temp1 = Cesium.Matrix4.multiplyByVector(
                        viewer.camera.viewMatrix,
                        cartesian4Center1,
                        scratchCartesian4Center1
                    );
                    let temp2 = Cesium.Matrix4.multiplyByVector(
                        viewer.camera.viewMatrix,
                        cartesian4Center2,
                        scratchCartesian4Center2
                    );

                    scratchCartesian3Normal.x = temp1.x - temp.x;
                    scratchCartesian3Normal.y = temp1.y - temp.y;
                    scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(
                        scratchCartesian3Normal,
                        scratchCartesian3Normal
                    );

                    scratchCartesian3Normal1.x = temp2.x - temp.x;
                    scratchCartesian3Normal1.y = temp2.y - temp.y;
                    scratchCartesian3Normal1.z = temp2.z - temp.z;

                    let tempTime =
                        ((new Date().getTime() - time) % duration) / duration;
                    Cesium.Quaternion.fromAxisAngle(
                        scratchCartesian3Normal,
                        tempTime * Cesium.Math.PI * 2,
                        rotateQ
                    );
                    Cesium.Matrix3.fromQuaternion(rotateQ, rotateM);
                    Cesium.Matrix3.multiplyByVector(
                        rotateM,
                        scratchCartesian3Normal1,
                        scratchCartesian3Normal1
                    );
                    Cesium.Cartesian3.normalize(
                        scratchCartesian3Normal1,
                        scratchCartesian3Normal1
                    );
                    return scratchCartesian3Normal1;
                },
                u_scanColor: scanColor,
            },
        });
    }

    get source() {
        return `
            // 彩色纹理
            uniform sampler2D colorTexture;
            // 深度纹理
            uniform sampler2D depthTexture;
            // 纹理坐标
            varying vec2 v_textureCoordinates;
            // 扫描中心
            uniform vec4 u_scanCenterEC;
            // 扫描平面法线EC
            uniform vec3 u_scanPlaneNormalEC;
            // 扫描线法线EC
            uniform vec3 u_scanLineNormalEC;
            // 半径
            uniform float u_radius;
            // 扫描的颜色
            uniform vec4 u_scanColor;

            vec4 toEye(in vec2 uv, in float depth) {
                vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
                vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);
                posInCamera =posInCamera / posInCamera.w;
                return posInCamera;
            }

            bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt) {
                vec3 v01 = testPt - ptOnLine;
                normalize(v01);
                vec3 temp = cross(v01, lineNormal);
                float d = dot(temp, u_scanPlaneNormalEC);
                return d > 0.5;
            }

            vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
                vec3 v01 = point -planeOrigin;
                float d = dot(planeNormal, v01) ;
                return (point - planeNormal * d);
            }

            float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt) {
                vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);
                return length(tempPt - ptOnLine);
            }

            float getDepth(in vec4 depth) {
                float z_window = czm_unpackDepth(depth);
                z_window = czm_reverseLogDepth(z_window);
                float n_range = czm_depthRange.near;
                float f_range = czm_depthRange.far;
                return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
            }

            void main() {
                // 得到釉色 = 结构二维(彩色纹理, 纹理坐标)
                gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
                // 深度 = ( 釉色 = 结构二维(深度纹理, 纹理坐标) )
                float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
                // 视角 = (纹理坐标,深度)
                vec4 viewPos = toEye(v_textureCoordinates, depth);
                // 平面点投影 = (扫描平面法线,扫描中心,视角)
                vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
                // 差值
                float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
                // 直径 = 两个半径
                float twou_radius = u_radius * 2.0;
                if(dis < u_radius) {
                    float f0 = 1.0 - abs(u_radius - dis) / u_radius;
                    f0 = pow(f0, 64.0);
                    vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;
                    float f = 0.0;
                    if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz)) {
                        float dis1= length(prjOnPlane.xyz - lineEndPt);
                        f = abs(twou_radius -dis1) / twou_radius;
                        f = pow(f, 3.0);
                    }
                    gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);
                }
            }
        `;
    }
}
