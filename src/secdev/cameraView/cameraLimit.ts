import { Viewer, Entity, Cartesian3, HeadingPitchRoll } from "cesium";

export type CameraLimitOptionType = {
    position: Cartesian3; // 限制中心点
    radius: number; // 限制半径
    debugExtent: boolean; // 是否显示限制范围
};
export type CameraRollbackViewType = {
    destination?: Cartesian3; // 初始位置
    orientation?: HeadingPitchRoll; // 初始方向
    duration?: number; // 回滚动画事件
};

export default class cameraLimit {
    #viewer: Viewer;
    #options: CameraLimitOptionType; // 限制范围球相关参数
    #rollbackView: CameraRollbackViewType; // 相机回滚参数
    #ellipsoid: Entity; // 限制范围球实体
    /**
     * @description: 相机范围限制，超出范围会回滚至范围内
     * @param {Viewer} viewer Viewer
     * @param {CameraLimitOptionType} options 限制范围球相关参数
     * @param {number} duration (可选)相机回滚时间,默认为1s
     * @return {*}
     */
    constructor(
        viewer: Viewer,
        options: CameraLimitOptionType,
        duration: number = 1
    ) {
        this.#viewer = viewer;
        this.#options = options;
        const camera = this.#viewer.scene.camera;
        this.#rollbackView = {
            destination: this.#options.position,
            orientation: new Cesium.HeadingPitchRoll(
                camera.heading,
                camera.pitch,
                camera.roll
            ),
            duration: duration,
        };
        this.#ellipsoid = new Entity();
    }

    /**
     * @description: 开启相机范围限制
     * @param {boolean} strict (可选)是否立即回滚，默认为false
     * @return {*}
     */
    setLimit(strict: boolean = false) {
        if (this.#options.debugExtent) {
            //添加限制范围轮廓
            this.#addLimitEllipsoid();
        }
        const cross = this.#isCross();
        if (cross) {
            // @ts-ignore
            this.#viewer.camera.flyTo(this.#rollbackView);
        }
        if (!strict) {
            this.#limitView1();
        } else {
            this.#limitView2();
        }
    }

    /**
     * @description: 移除相机范围限制
     * @return {*}
     */
    removeLimit() {
        this.#viewer.camera.moveEnd.removeEventListener(
            this.#cameraMoveEndEventHnadle,
            this
        );
        this.#viewer.camera.changed.removeEventListener(
            this.#cameraMoveEndEventHnadle,
            this
        );
        this.#viewer.entities.remove(this.#ellipsoid);
        this.#rollbackView.destination = this.#options.position;
    }

    #limitView1() {
        this.#viewer.camera.moveEnd.addEventListener(
            this.#cameraMoveEndEventHnadle,
            this
        );
    }

    #limitView2() {
        this.#viewer.camera.changed.addEventListener(
            this.#cameraMoveEndEventHnadle,
            this
        );
    }

    /**
     * @description: 添加限制区域轮廓
     * @return {*}
     */
    #addLimitEllipsoid() {
        const radius = this.#options.radius;
        const position = this.#options.position;
        const show = this.#options.debugExtent;
        this.#ellipsoid = this.#viewer.entities.add({
            position,
            show,
            ellipsoid: {
                radii: new Cesium.Cartesian3(radius, radius, radius),
                maximumCone: Cesium.Math.toRadians(180),
                material: Cesium.Color.RED.withAlpha(0.1),
                subdivisions: 128,
                stackPartitions: 32,
                slicePartitions: 32,
                outline: true,
                outlineColor: Cesium.Color.AQUA.withAlpha(1),
            },
        });
    }

    /**
     * @description: 相机事件，触发回滚
     * @return {*}
     */
    #cameraMoveEndEventHnadle() {
        const cross = this.#isCross();
        if (cross) {
            // @ts-ignore
            this.#viewer.camera.flyTo(this.#rollbackView);
        } else {
            const camera = this.#viewer.camera;
            this.#rollbackView = {
                destination: Cesium.Cartesian3.clone(
                    this.#viewer.camera.position
                ),
                orientation: new Cesium.HeadingPitchRoll(
                    camera.heading,
                    camera.pitch,
                    camera.roll
                ),
                duration: this.#rollbackView.duration,
            };
        }
    }

    /**
     * @description: 判断是否越界
     * @return {boolean}
     */
    #isCross(): boolean {
        let p = this.#viewer.camera.position; //相机位置
        let distance = Cesium.Cartesian3.distance(p, this.#options.position); //两个点的距离
        return distance > this.#options.radius;
    }
}
