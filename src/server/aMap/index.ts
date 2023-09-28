/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-28 11:48:50
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-28 11:49:00
 * @FilePath: \cesium-secdev-set\src\server\aMap\index.ts
 * @Description: 高德服务
 */
import axios from "axios";

const server = axios.create({
    baseURL: window.$config.ip.aMap,
});
server.defaults.headers.common["Content-Type"] = "application/json;charset=utf-8";

export default server;