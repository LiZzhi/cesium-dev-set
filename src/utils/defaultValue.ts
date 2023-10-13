/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-10-12 09:51:42
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2023-10-12 09:54:47
 * @FilePath: \cesium-secdev-set\src\utils\defaultValue.ts
 * @Description: 设置默认值，主要是为了排除非 undefined 带来的false判断，例如0
 */
export default function defaultValue<T>(value:T|undefined, def:T):T{
    return value === undefined? def : value;
}