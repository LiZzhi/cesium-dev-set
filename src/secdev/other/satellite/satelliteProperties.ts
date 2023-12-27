import { Viewer, Clock, JulianDate, Cartesian3, SampledPositionProperty, Event } from "cesium";
import satellitejs from "satellite.js";
import orbit from "./orbit"
import defaultValue from "@/utils/defaultValue";

export type satProOptionType = {
    sideSwingAngle: number; // 卫星侧摆角
    pitch: number;  // 卫星侧摆角度
    roll: number;   // 卫星旋转角度
    xFov: number;   // 卫星方锥形波束横向张角
    yFov: number;   // 卫星方锥形波束纵向张角
    fov: number;    // 卫星圆锥形波束张角
}

export default class satelliteProperties {
    name: string;
    orbit: orbit;
    options: satProOptionType;

    #viewer: Viewer;
    #lastDate: JulianDate;
    #lastPosition: undefined|Cartesian3;

    #removeCallback: Event.RemoveCallback|undefined;

    sampledPosition: SampledPositionProperty;
    conSampledPosition: SampledPositionProperty;
    constructor(viewer: Viewer, tle: string, options: Partial<satProOptionType>) {
        this.name = tle.split("\n")[0].trim();
        if(tle.startsWith("0 ")){
            this.name = this.name.substring(2);
        }
        this.#viewer = viewer;

        // 轨道
        this.orbit = new orbit(this.name, tle);

        // 配置项
        this.options = Object.assign(this.defaultOptions, options)


        this.#lastDate = new Cesium.JulianDate();
        this.#lastPosition = undefined;

        this.sampledPosition = this.#createSampledPosition();
        this.conSampledPosition = this.#createSampledPosition();
    }

    /**
     * @description: 对点坐标进行差值
     * @return {*}
     */
    createSampledPosition() {
        let clock = this.#viewer.clock;
        let lastUpdated = this.#updateSampledPosition(clock.currentTime);
        this.#removeCallback = clock.onTick.addEventListener(() => {
            const dt = Math.abs(
                Cesium.JulianDate.secondsDifference(clock.currentTime, lastUpdated)
            );
            if (dt >= 60 * 15) {
                lastUpdated = this.#updateSampledPosition(clock.currentTime);
            }
        }, this);
    }

    /**
     * @description: 销毁
     * @return {*}
     */
    destroy(){
        if (this.#removeCallback) {
            this.#viewer.clock.onTick.removeEventListener(this.#removeCallback);
        }
    }

    /**
     * @description: 计算当前位置
     * @param {JulianDate} julianTime
     * @return {*}
     */
    position(julianTime: JulianDate) {
        let dateTime = Cesium.JulianDate.toDate(julianTime);
        let cat = this.orbit.positionGeodetic(dateTime);
        return Cesium.Cartesian3.fromRadians(cat.longitude, cat.latitude, cat.height);
    }

    get defaultOptions() {
        return {
            sideSwingAngle: 0,
            pitch: 0,
            roll: 0,
            xFov: 10,
            yFov: 10,
            fov: 10,
        }
    }

    /**
     * @description: 更新差值点坐标
     * @return {*}
     */
    #updateSampledPosition(julianDate: JulianDate, samplesFwd = 240, samplesBwd = 120, interval = 30) {
        const randomOffset = Math.random() * 60 * 15;
        let reference = Cesium.JulianDate.addSeconds(
            julianDate,
            randomOffset,
            new Cesium.JulianDate()
        );

        const startTime = -samplesBwd * interval;
        const stopTime = samplesFwd * interval;
        for (let time = startTime; time <= stopTime; time += interval) {
            const timestamp = Cesium.JulianDate.addSeconds(
                reference,
                time,
                new Cesium.JulianDate()
            );
            const position = this.#computePositionCartesian3(timestamp);
            this.sampledPosition.addSample(timestamp, position);

            const cat = Cesium.Cartographic.fromCartesian(position);
            const conePosition = Cesium.Cartesian3.fromRadians(cat.longitude, cat.latitude, cat.height/2);
            this.conSampledPosition.addSample(timestamp, conePosition);
        }

        return reference;
    }

    /**
     * @description: 计算世界坐标
     * @param {JulianDate} julianDate
     * @return {*}
     */
    #computePositionCartesian3(julianDate: JulianDate) {
        // Check if Position for current timestap is already computed
        if (this.#lastPosition && Cesium.JulianDate.compare(this.#lastDate, julianDate) === 0) {
            return this.#lastPosition;
        }

        this.#lastDate = julianDate;
        const { longitude, latitude, height } = this.orbit.positionGeodetic(
            Cesium.JulianDate.toDate(julianDate)
        );
        this.#lastPosition = Cesium.Cartesian3.fromRadians(longitude, latitude, height);

        return this.#lastPosition;
    }

    #createSampledPosition(){
        const sampledPosition = new Cesium.SampledPositionProperty();
        sampledPosition.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
        sampledPosition.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
        sampledPosition.setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
        });
        return sampledPosition;
    }
}