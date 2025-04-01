/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2025-03-25 18:51:28
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2025-03-25 19:01:04
 * @FilePath: \cesium-secdev-set\src\secdev\cameraView\ExtendSampledPositionProperty.ts
 * @Description: 解决getValue返回undefined导致entity获取不到坐标消失问题
 */
import {
    SampledPositionProperty,
    ReferenceFrame,
    Cartesian3,
    JulianDate,
    defined,
} from "cesium";

export default class ExtendSampledPositionProperty extends SampledPositionProperty {
    lastPosition: undefined | Cartesian3;
    constructor(
        referenceFrame = ReferenceFrame.FIXED,
        numberOfDerivatives = 0
    ) {
        super(referenceFrame, numberOfDerivatives);
        this.lastPosition = undefined;
    }

    /**
     * @description: 解决getValue返回undefined导致entity获取不到坐标消失问题
     * @param {JulianDate} time
     * @param {*} result
     * @return {*}
     */
    getValue(time: JulianDate, result = new Cartesian3()) {
        let p = this.getValueInReferenceFrame(
            time,
            ReferenceFrame.FIXED,
            result
        );
        if (p) {
            this.lastPosition = p.clone();
            return p;
        } else {
            return this.lastPosition;
        }
    }
}
