/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-25 20:35:27
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-25 20:42:24
 * @FilePath: \cesium-secdev-set\public\config\baseConfig.js
 * @Description: 配置文件
 */

const ip = {
    ALIYUN: "/aLiYun",
    AMAP: "/aMap",
};

const token = {
    CESIUM_TOKEN:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOTNiYjkwZi1iMzRlLTRjZWQtYWQxMy00MDVmMjk4YTc0YmMiLCJpZCI6MzY3MDksImlhdCI6MTY1NTE3OTc1N30.fv4nNIkCEEy3VqlaekWVcE1btEcge5_zCl_36AtusT0",
    TIANDITU_TOKEN: "aa433bc68a49e6e19b7db0974333b6ba",
};

// 全局配置
window.$config = {
    ip,
    token,
};
