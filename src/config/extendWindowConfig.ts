export default function () {
    let mode = process?.env?.NODE_ENV === 'development' ? 'development' : 'production';
    let ip: Record<string, string> = {};
    if (mode === 'development') {
        ip = {
            ALIYUN: "/aLiYun",
            AMAP: "/aMap",
            BASE: "/base",
        }
    } else {
        ip = {
            ALIYUN: "https://geo.datav.aliyun.com",
            AMAP: "https://restapi.amap.com",
            BASE: "http://47.104.183.173",
        }
    }
    window.$config.ip = ip;
}