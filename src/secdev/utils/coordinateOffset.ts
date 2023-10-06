/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-06 20:50:49
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-06 22:01:29
 * @FilePath: \cesium-secdev-set\src\secdev\utils\CoordinateOffset.ts
 * @Description: 坐标偏移转换工具，包括对 WGS84、百度坐标系、高德坐标系的互转函数
 */

export default class coordinateOffset {
    static PI = 3.14159265358979324;
    static x_pi = this.PI * 3000.0 / 180.0;
    static a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
    static ee = 0.00669342162296594323; //  ee: 椭球的偏心率。

    /**
     * @description: WGS84 转 高德(火星)，WGS-84 to GCJ-02
     * @param {number} wgsLon
     * @param {number} wgsLat
     * @return {*}
     */
    static gcj_encrypt(wgsLon: number, wgsLat: number) {
        if (this.outOfChina(wgsLon, wgsLat))
            return [wgsLon, wgsLat];

        let d = this.delta(wgsLon, wgsLat);
        return [wgsLon + d[0], wgsLat + d[1]];
    }
    /**
     * @description: 高德(火星) 转 WGS84，GCJ-02 to WGS-84
     * @param {number} gcjLon
     * @param {number} gcjLat
     * @return {*}
     */
    static gcj_decrypt(gcjLon: number, gcjLat: number) {
        if (this.outOfChina(gcjLon, gcjLat))
            return [gcjLon, gcjLat];

        let d = this.delta(gcjLon, gcjLat);
        return [gcjLon - d[0], gcjLat - d[1]];
    }

    /**
     * @description: 高德(火星) 转 百度(BD-09)，GCJ-02 to BD-09
     * @param {number} gcjLon
     * @param {number} gcjLat
     * @return {*}
     */
    static bd_encrypt(gcjLon: number, gcjLat: number) {
        let x = gcjLon, y = gcjLat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
        let bdLon = z * Math.cos(theta) + 0.0065;
        let bdLat = z * Math.sin(theta) + 0.006;
        return [bdLon, bdLat];
    }

    /**
     * @description: 百度(BD-09) 转 高德(火星)，BD-09 to GCJ-02
     * @param {number} bdLon
     * @param {number} bdLat
     * @return {*}
     */
    static bd_decrypt(bdLon: number, bdLat: number) {
        let x = bdLon - 0.0065, y = bdLat - 0.006;
        let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
        let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
        let gcjLon = z * Math.cos(theta);
        let gcjLat = z * Math.sin(theta);
        return [gcjLon, gcjLat];
    }

    /**
     * @description: WGS-84 转 Web mercator
     * @param {number} wgsLon
     * @param {number} wgsLat
     * @return {*}
     */
    static mercator_encrypt(wgsLon: number, wgsLat: number) {
        let x = wgsLon * 20037508.34 / 180.;
        let y = Math.log(Math.tan((90. + wgsLat) * this.PI / 360.)) / (this.PI / 180.);
        y = y * 20037508.34 / 180.;
        return [x, y];
    }
    /**
     * @description: Web mercator 转 WGS-84
     * @param {number} x
     * @param {number} y
     * @return {*}
     */
    static mercator_decrypt(x: number, y: number) {
        let lon = x / 20037508.34 * 180.;
        let lat = y / 20037508.34 * 180.;
        lat = 180 / this.PI * (2 * Math.atan(Math.exp(lat * this.PI / 180.)) - this.PI / 2);
        return [lon, lat];
    }

    static delta(lon: number, lat: number){
        // Krasovsky 1940
        let dLat = this.transformLat(lon - 105.0, lat - 35.0);
        let dLon = this.transformLon(lon - 105.0, lat - 35.0);
        let radLat = lat / 180.0 * this.PI;
        let magic = Math.sin(radLat);
        magic = 1 - this.ee * magic * magic;
        let sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * this.PI);
        dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * this.PI);
        return [dLon, dLat];
    }

    /**
     * @description: 是否在中国
     * @param {number} lon 经度
     * @param {number} lat 纬度
     * @return {*}
     */
    static outOfChina(lon: number, lat: number) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    }

    static transformLat(lon: number, lat: number) {
        let ret = -100.0 + 2.0 * lon + 3.0 * lat + 0.2 * lat * lat + 0.1 * lon * lat + 0.2 * Math.sqrt(Math.abs(lon));
        ret += (20.0 * Math.sin(6.0 * lon * this.PI) + 20.0 * Math.sin(2.0 * lon * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    static transformLon(lon: number, lat: number) {
        let ret = 300.0 + lon + 2.0 * lat + 0.1 * lon * lon + 0.1 * lon * lat + 0.1 * Math.sqrt(Math.abs(lon));
        ret += (20.0 * Math.sin(6.0 * lon * this.PI) + 20.0 * Math.sin(2.0 * lon * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lon * this.PI) + 40.0 * Math.sin(lon / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lon / 12.0 * this.PI) + 300.0 * Math.sin(lon / 30.0 * this.PI)) * 2.0 / 3.0;
        return ret;
    }
}
