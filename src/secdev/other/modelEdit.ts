import {
    Cartesian3,
    LabelCollection,
    Matrix4,
    Model,
    PrimitiveCollection,
    Viewer,
    Color,
    HeadingPitchRoll,
} from "cesium";

interface Change {
    transX: number;
    transY: number;
    transZ: number;
    heading: number;
    pitch: number;
    roll: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
}

export default class {
    viewer: Viewer;
    model: Model;
    modelMatrix: Matrix4;
    origin: Cartesian3;
    originTrans: Matrix4;
    change: Change;
    constructor(viewer: Viewer, origin: Cartesian3) {
        this.viewer = viewer;
        // 初始状态
        this.origin = origin;
        this.originTrans = Cesium.Transforms.eastNorthUpToFixedFrame(
            this.origin
        );
        this.change = {
            transX: 0,
            transY: 0,
            transZ: 0,
            heading: 0,
            pitch: 0,
            roll: 0,
            scaleX: 0,
            scaleY: 0,
            scaleZ: 0,
        };
        // 矩阵
        this.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            this.origin
        );
        // 模型
        this.model = Cesium.Model.fromGltf({
            url: require("../assets/gltf/pathRoaming/CesiumMilkTruck.glb"),
            scale: 50,
            modelMatrix: this.modelMatrix,
        });
        viewer.scene.primitives.add(this.model);

    }

    set transX(offset: number) {
        this.change.transX = offset;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set transY(offset: number) {
        this.change.transY = offset;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set transZ(offset: number) {
        this.change.transZ = offset;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set heading(angle: number) {
        this.change.heading = angle;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set pitch(angle: number) {
        this.change.pitch = angle;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set roll(angle: number) {
        this.change.roll = angle;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set scaleX(size: number) {
        this.change.scaleX = size;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set scaleY(size: number) {
        this.change.scaleY = size;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }

    set scaleZ(size: number) {
        this.change.scaleZ = size;
        let modelMatrix = this.computeModelMatrix();
        this.model.modelMatrix = modelMatrix;
    }
    /**
     * @description: 变化的位姿
     * @return {*}
     */
    get poseOffset() {
        return this.change;
    }
    /**
     * @description: 当前中心点
     * @return {*}
     */
    get position() {
        return Cesium.Matrix4.multiplyByPoint(
            this.originTrans,
            new Cesium.Cartesian3(
                this.change.transX,
                this.change.transY,
                this.change.transZ
            ),
            new Cesium.Cartesian3()
        );
    }

    computeModelMatrix() {
        let trans = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
        return trans;
        // let rotateM3 = Cesium.Matrix3.fromHeadingPitchRoll(
        //     new Cesium.HeadingPitchRoll(
        //         Cesium.Math.toRadians(this.change.heading),
        //         Cesium.Math.toRadians(this.change.pitch),
        //         Cesium.Math.toRadians(this.change.roll)
        //     )
        // );
        // let scaleM3 = Cesium.Matrix3.fromScale(
        //     new Cesium.Cartesian3(
        //         this.change.scaleX,
        //         this.change.scaleY,
        //         this.change.scaleZ
        //     )
        // );
        // let rotateScaleM3 = new Cesium.Matrix3();
        // Cesium.Matrix3.multiply(rotateM3, scaleM3, rotateScaleM3);
        // let modelMatrix = new Cesium.Matrix4();
        // Cesium.Matrix4.multiplyByMatrix3(trans, rotateScaleM3, modelMatrix);
        // return modelMatrix;
    }
}
