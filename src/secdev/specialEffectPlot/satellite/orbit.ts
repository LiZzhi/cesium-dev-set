/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-11 10:02:33
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-11 14:54:50
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\satellite\orbit.ts
 * @Description: 卫星轨道
 */
import * as satellitejs from "satellite.js";
import dayjs from "dayjs";
import { worldDegreesType } from "../../type";

type EciVec3<T> = satellitejs.EciVec3<T>
export type positionVelocity = {
    longitude: number,
    latitude: number,
    height: number,
    velocity?: number,
}

export type passOptionType = {
    startDate: Date;
    endDate: Date;
    minElevation: number;
    maxPasses: number;
}

export type passType = {
    name: string;
    start: number;
    end: number;
    duration: number;
    azimuthStart: number;
    azimuthEnd: number;
    maxElevation: number;
    azimuthApex: number;
}

export default class satelliteOrbit {
    #name: string;
    #tle: string[];
    #satrec: satellitejs.SatRec;
    constructor(name: string, tle: string){
        this.#name = name;
        this.#tle = tle.split("\n");
        this.#satrec = satellitejs.twoline2satrec(this.#tle[1], this.#tle[2]);
    }

    /**
     * @description: TLE文件中给出的唯一卫星号码
     * @return {*}
     */
    get satnum() {
        return this.#satrec.satnum;
    }

    /**
     * @description: 获取轨道周期
     * @return {*}
     */
    get orbitalPeriod() {
        const meanMotionRad = this.#satrec.no;
        const period = (2 * Math.PI) / meanMotionRad;
        return period;
    }

    positionECI(time: Date) {
        return satellitejs.propagate(this.#satrec, time).position;
    }

    positionECF(time: Date) {
        const positionEci = this.positionECI(time);
        const gmst = satellitejs.gstime(time);
        const positionEcf = satellitejs.eciToEcf(<EciVec3<number>>positionEci, gmst);
        return positionEcf;
    }

    /**
     * @description: 卫星惯性坐标转经纬度
     * @param {Date} time
     * @return {*} 注意结果为弧度
     */
    positionGeodetic(time: Date): positionVelocity {
        const positionEci = this.positionECI(time);
        const gmst = satellitejs.gstime(time);
        const positionGd = satellitejs.eciToGeodetic(<EciVec3<number>>positionEci, gmst);

        return {
            longitude: positionGd.longitude,
            latitude: positionGd.latitude,
            height: positionGd.height * 1000,
        };
    }

    computeGeodeticPositionVelocity(timestamp: Date): positionVelocity {
        const positionAndVelocity = satellitejs.propagate(this.#satrec, timestamp);
        const positionEci = positionAndVelocity.position;
        const velocityEci = positionAndVelocity.velocity;

        const gmst = satellitejs.gstime(timestamp);
        const positionGd = satellitejs.eciToGeodetic(<EciVec3<number>>positionEci, gmst);
        const velocityGd = satellitejs.eciToGeodetic(<EciVec3<number>>velocityEci, gmst);
        const velocity = Math.sqrt(
                velocityGd.longitude * velocityGd.longitude +
                velocityGd.latitude * velocityGd.latitude +
                velocityGd.height * velocityGd.height
        );

        return {
            longitude: positionGd.longitude,
            latitude: positionGd.latitude,
            height: positionGd.height * 1000,
            velocity,
        };
    }

    computePasses(
        groundStation: worldDegreesType, option: Partial<passOptionType> = {}
    ) {
        let nowDate = dayjs().toDate();
        const {startDate, endDate, minElevation, maxPasses} = Object.assign({
            startDate: nowDate,
            endDate: dayjs(nowDate).add(7, 'day').toDate(),
            minElevation: 0,
            maxPasses: 20
        }, option)

        const deg2rad = Math.PI / 180;
        const cartographic = {
            latitude: groundStation.lat * deg2rad,
            longitude: groundStation.lon * deg2rad,
            height: (groundStation.height || 0) / 1000,
        };

        let date = startDate;
        let passes:passType[] = [];
        let pass:any;
        let ongoingPass = false;
        let lastElevation = 0;

        while (date < endDate) {
            const positionEcf = this.positionECF(date);
            const lookAngles = satellitejs.ecfToLookAngles(cartographic, positionEcf);
            const elevation = lookAngles.elevation / deg2rad;   // 高度角

            if (elevation > 0) {
                if (!ongoingPass) {
                    // 卫星周期
                    pass = {
                        name: this.#name,
                        start: date.getTime(),
                        azimuthStart: lookAngles.azimuth,
                        maxElevation: elevation,
                        azimuthApex: lookAngles.azimuth,
                    };
                    ongoingPass = true;
                } else {
                    // 进入
                    if (elevation > pass.maxElevation) {
                        pass.maxElevation = elevation;
                        pass.azimuthApex = lookAngles.azimuth;
                    }
                }
                date.setSeconds(date.getSeconds() + 5);
            } else {
                if (ongoingPass) {
                    // 退出
                    if (pass.maxElevation > minElevation) {
                        pass.end = date.getTime();
                        pass.duration = pass.end - pass.start;
                        pass.azimuthEnd = lookAngles.azimuth;
                        pass.azimuthStart /= deg2rad;
                        pass.azimuthApex /= deg2rad;
                        pass.azimuthEnd /= deg2rad;
                        passes.push(pass);
                        if (passes.length > maxPasses) {
                            break;
                        }
                    }
                    ongoingPass = false;
                    lastElevation = -180;
                    date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
                } else {
                    let deltaElevation = elevation - lastElevation;
                    lastElevation = elevation;
                    if (deltaElevation < 0) {
                        date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
                        lastElevation = -180;
                    } else if (elevation < -20) {
                        date.setMinutes(date.getMinutes() + 5);
                    } else if (elevation < -5) {
                        date.setMinutes(date.getMinutes() + 1);
                    } else if (elevation < -1) {
                        date.setSeconds(date.getSeconds() + 5);
                    } else {
                        date.setSeconds(date.getSeconds() + 2);
                    }
                }
            }
        }
        return passes;
    }
}
