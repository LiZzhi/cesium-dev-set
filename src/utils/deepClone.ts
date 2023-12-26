/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-26 14:00:23
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-12-26 14:04:22
 * @FilePath: \cesium-secdev-set\src\utils\deepClone.ts
 * @Description: 深拷贝
 */


export default function deepClone(obj: any) {
    if (obj && typeof obj === "object") {
        let objClone: any = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //判断ojb子元素是否为对象，如果是，递归复制
                if (obj[key] && typeof obj[key] === "object") {
                    objClone[key] = deepClone(obj[key]);
                } else {
                    //如果不是，简单复制
                    objClone[key] = obj[key];
                }
            }
        }
        return objClone;
    } else {
        return obj;
    }
}
