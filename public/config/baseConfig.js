/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-25 20:35:27
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2025-04-10 15:31:46
 * @FilePath: \cesium-dev-set\public\config\baseConfig.js
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
    GEOVIS_TOKEN:
        "c12979f9caccfc2e24b822852976c264c3c33403a87bafd21b0f4eb2de4bd79e",
    MAPBOX_TOKEN:
        "pk.eyJ1IjoiMTg5NDY2NTY3MTIiLCJhIjoiY2t5YmMzc2NtMGRwbzJubjB4MTZxaW9xeSJ9.wOm82Obrzb9T375N7cSjdQ",
};

const defaultDestination = [120.41574749368507, 36.01753343729183, 7000];
const defaultOrientation = [351.10969557291713, -37.01115606241999, 359.99620995832095];

// 全局配置
window.$config = {
    ip,
    token,
    defaultDestination,
    defaultOrientation,
};
