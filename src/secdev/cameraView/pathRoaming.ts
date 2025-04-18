import * as turf from "@turf/turf";
import type {
    Entity,
    DataSource,
    Cartesian3,
    Cartographic,
    Viewer,
} from "cesium";
import getHeading from "../utils/getHeading";
import { ElMessage } from "element-plus";
import getTerrainMostDetailedHeight from "../utils/getTerrainMostDetailedHeight";

const CZML = require("../assets/json/pathRoaming/CZML.json")

export enum roamingEnum {
    PEOPLE_ROAM = 1,
    CAR_ROAM = 2,
    UAV_ROAM = 3,
}

export enum viewEnum {
    TPP = 1,
    FPP = 2,
}

export default class pathRoaming {
    #viewer: Viewer;
    #CZML: any;
    #roamPath: Cartographic[];
    #czmlDataSource: DataSource | undefined;
    #listener: any;
    #trackingEntity: Entity | undefined;
    #viewType: viewEnum;
    #isStart: boolean;
    speed: number;
    height: number;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        this.#CZML = undefined;
        this.#isStart = false; // 是否创建了漫游
        this.#roamPath = []; // 漫游路径
        this.#listener = undefined; // view2 时的事件监听
        this.#czmlDataSource = undefined;
        this.#trackingEntity = undefined; // 视角跟踪的 Entity
        this.#viewType = viewEnum.TPP;
        this.speed = 50; // 速度
        this.height = 0; // 高度
    }

    /**
     * 设置基础速度,请在设置漫游路径前使用,否则不会改变当前正在漫游的速度
     * @param { number } speed 速度
     */
    set roamSpeed(speed: number) {
        if (!this.#isStart) {
            this.speed = speed;
        } else {
            ElMessage.error("请在设置漫游路径前使用");
        }
    }

    /**
     * 获取础速度,注意,该速度不一定为实际动画速度
     * @returns { number }
     */
    get roamSpeed(): number {
        return this.speed;
    }

    /**
     * 设置漫游速度,实际为设置 clock 运行倍速,请传入大于 0 的参数
     * @param { number } multiple 基础速度的倍数,例如 speed 为 10,要设置为 20 请传入 2
     */
    set runSpeed(multiple: number) {
        if (multiple > 0) {
            this.#viewer.clock.multiplier = multiple;
        } else {
            ElMessage.error("请设置大于0的值");
        }
    }

    /**
     * 设置离地高度,请在设置漫游路径前使用,否则不会改变当前正在漫游的高度
     * @param { number } height 离地高度
     */
    set roamHeight(height: number) {
        if (!this.#isStart) {
            this.height = height;
        } else {
            ElMessage.error("请在设置漫游路径前使用");
        }
    }

    /**
     * 获取离地表高度
     * @returns { number }
     */
    get roamHeight(): number {
        return this.height;
    }

    /**
     * 获取漫游路径
     * @returns { Cartographic[] }
     */
    get getPath(): Cartographic[] {
        return this.#roamPath;
    }

    /**
     * 是否已设置漫游路径
     * @returns { boolean }
     */
    get isStart(): boolean {
        return this.#isStart;
    }

    /**
     * 开始漫游
     * @param { Cartographic[] } ps 漫游路径(角度)
     * @param { viewType } viewType (可选)漫游视角,默认为 viewType.TPP
     */
    startRoaming(
        ps: Cartographic[],
        viewType: viewEnum = viewEnum.TPP,
        roamingType: roamingEnum = roamingEnum.CAR_ROAM
    ): void {
        if (ps.length === 0) {
            ElMessage.error("漫游路径为空");
            return;
        }
        if (this.#isStart) {
            // 用于暂停后恢复
            if (this.#viewType === viewEnum.TPP) {
                this.#viewer.trackedEntity = this.#trackingEntity;
            }
            this.#viewer.clock.shouldAnimate = true;
        } else {
            // 初始化并开始漫游
            const buildSuccess = this.#buildCZML(ps, roamingType);
            if(!buildSuccess){
                return;
            }
            // 漫游视角 1, 2 分别对应 view1 和 view2
            this.#viewType = viewType;
            this.#CZML[1].id += Date.now() + ''
            this.#viewer.dataSources
                .add(Cesium.CzmlDataSource.load(this.#CZML))
                .then((ds) => {
                    this.#czmlDataSource = ds;
                    this.#trackingEntity = ds.entities.getById(
                        this.#CZML[1].id
                    ) as Entity;
                    // this.#trackingEntity.model && (this.#trackingEntity.model.heightReference = new Cesium.ConstantProperty (Cesium.HeightReference.RELATIVE_TO_GROUND))
                    if (this.#viewType === viewEnum.TPP) {
                        this.#view1();
                    } else {
                        this.#view2();
                    }
                });

            this.#viewer.clock.multiplier = 1;
            this.#viewer.clock.shouldAnimate = true;
            this.#isStart = true;
        }
    }

    /**
     * 暂停漫游
     */
    stopRoaming() {
        this.#viewer.trackedEntity = undefined;
        this.#viewer.clock.shouldAnimate = false;
    }

    /**
     * 销毁
     */
    destroy() {
        this.#viewer.clock.shouldAnimate = false;
        this.#isStart = false;
        if (this.#listener) {
            this.#viewer.scene.postRender.removeEventListener(this.#listener);
        }
        if (this.#czmlDataSource) {
            this.#viewer.dataSources.remove(this.#czmlDataSource);
        }
        this.#viewer.trackedEntity = undefined;
        this.#trackingEntity = new Cesium.Entity();
        this.#CZML = null;
        this.#roamPath.length = 0;
    }

    /**
     * 构建 CZML
     * @param { Cartographic[] } ps 漫游路径(角度)
     * @param { roamingType } roamingType (可选), 1:"行人漫游", (默认)2:"车辆漫游", 3:"飞行漫游"
     */
    #buildCZML(ps: Cartographic[], roamingType: roamingEnum = roamingEnum.CAR_ROAM): boolean {
        if (ps.length === 0) {
            ElMessage.error("请传入有效漫游路径");
            return false;
        }
        this.#setRoamingType(roamingType);
        this.#roamPath = JSON.parse(JSON.stringify(ps));
        let startTime = Cesium.JulianDate.fromIso8601("2012-08-04T10:00:00Z");
        let currentTime = startTime.clone();
        let lastPosition: number[];
        let cartographicArr = this.#CZML[1].position!.cartographicDegrees as (
            | string
            | number
        )[];
        // 添加 position
        ps.forEach((v) => {
            let nowPosition = [v.longitude, v.latitude, this.height];
            if (lastPosition) {
                let from = turf.point(lastPosition);
                let to = turf.point(nowPosition);
                // 计算两点间长度
                let distance = turf.rhumbDistance(from, to, {units: 'meters'});
                // 计算新时间
                currentTime = Cesium.JulianDate.addSeconds(
                    currentTime,
                    Math.ceil(distance / this.speed),
                    currentTime
                );
            }
            // 添加路径，注意坐标为经纬度，且格式为 [时间节点，经度, 维度, 高, ...]，此处时间节点就是用来计算速度的，每一个线段起始时间节点与终止时间节点定义了当前线段的速度
            cartographicArr.push(Cesium.JulianDate.toIso8601(currentTime));
            cartographicArr.push(nowPosition[0]);
            cartographicArr.push(nowPosition[1]);
            cartographicArr.push(nowPosition[2]);

            lastPosition = nowPosition;
        });
        // 根据上述计算的时间修改 availability
        this.#CZML[1].availability = `${startTime}/${currentTime}`;
        return true;
    }

    /**
     * 设置模型
     * @param { roamingType } roamingType (可选), 1:"行人漫游", (默认)2:"车辆漫游", 3:"飞行漫游"
     */
    #setRoamingType(roamingType: roamingEnum = roamingEnum.CAR_ROAM): void {
        this.#CZML = JSON.parse(JSON.stringify(CZML));
        switch (roamingType) {
            case roamingEnum.PEOPLE_ROAM:
                this.#CZML[1].model.gltf = require("../assets/gltf/pathRoaming/People.gltf");
                this.#CZML[1].model.scale = 0.01;
                break;
            case roamingEnum.CAR_ROAM:
                this.#CZML[1].model.gltf = require("../assets/gltf/pathRoaming/CesiumMilkTruck.glb");
                this.#CZML[1].model.scale = 1;
                break;
            case roamingEnum.UAV_ROAM:
                this.#CZML[1].model.gltf = require("../assets/gltf/pathRoaming/UAV.glb");
                this.#CZML[1].model.scale = 0.1;
                break;
        }
    }

    /**
     * 漫游视角1
     */
    #view1() {
        this.#viewer.trackedEntity = this.#trackingEntity;
    }

    /**
     * 漫游视角2
     */
    #view2() {
        let prePoint: Cartesian3;
        this.#listener = this.#viewer.scene.postRender.addEventListener(() => {
            if (this.#trackingEntity && this.#viewer.clock.shouldAnimate) {
                // 获取当前时间的位置
                let curPoint = this.#trackingEntity.position!.getValue(
                    this.#viewer.clock.currentTime
                );
                if (prePoint && curPoint) {
                    // 计算 heading
                    let heading = getHeading(prePoint, curPoint);
                    // 计算 pitch
                    let pitch = Cesium.Math.toRadians(-30.0);
                    let range = 100;
                    this.#viewer.camera.lookAt(
                        curPoint,
                        new Cesium.HeadingPitchRange(heading, pitch, range)
                    );
                }
                // 当前点在下一次渲染时为前一个点
                prePoint = Cesium.Cartesian3.clone(curPoint!);
            }
        });
    }
}
