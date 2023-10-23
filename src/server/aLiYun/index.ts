/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-09-20 09:43:15
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-09-20 10:28:39
 * @FilePath: \cesium-secdev-set\src\server\aLiYun\index.ts
 * @Description: 阿里云datav请求, https://datav.aliyun.com/portal/school/atlas/area_selector
 */
import axios from "axios";

const server = axios.create({
    baseURL: window.$config.ip.ALIYUN,
});
server.defaults.headers.common["Content-Type"] = "application/json;charset=utf-8";

export default server;