/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-09-14 09:54:31
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-09-14 10:39:47
 * @FilePath: \cesium-secdev-set\src\secdev\cameraView\rotation.ts
 * @Description: 地球自转
 */

import { Viewer } from "cesium";

export type rotationOptionType = {
    roteSpeed: number,  // 旋转速度
    height: number, // 初始高度
}

export default class rotation {
    #viewer: Viewer
    #preTime: number;
    #isStart: boolean;
    #options: rotationOptionType;
    constructor(viewer: Viewer, options: Partial<rotationOptionType>={}){
        this.#viewer = viewer;
        this.#preTime = 0;
        this.#isStart = false;
        this.#options = Object.assign(this.defaultOptions, options);
    }

    start(){
        if(!this.#isStart){
            this.#preTime = Date.now();
            this.#viewer.clock.onTick.addEventListener(this.#rotate, this);
            this.#isStart = true;
        }
    }

    stop(){
        if (this.#isStart) {
            this.#viewer.clock.onTick.removeEventListener(this.#rotate, this);
            this.#isStart = false;
        }
    }

    #rotate(){
        let alt = this.#viewer.camera.positionCartographic.height;
        let now = Date.now();
        let angle = (now - this.#preTime) / 1000 * this.#options.roteSpeed / 180 * Cesium.Math.PI * (alt / this.#options.height);
        this.#preTime = now;
        this.#viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -angle);
    }

    get defaultOptions(): rotationOptionType{
        return {
            roteSpeed: 5,
            height: 24678990.67414785,
        }
    }
}
