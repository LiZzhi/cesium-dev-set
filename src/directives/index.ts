/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-08-30 09:35:23
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-08-30 09:40:17
 * @FilePath: \cesium-secdev-set\src\Directives\index.ts
 * @Description: 全局指令插件
 */
import { App } from "vue";
import vMove from "./vMove";

export default{
    install(Vue: App<Element>){
        Vue.directive("move", vMove);
    }
}