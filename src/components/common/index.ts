/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-30 09:27:23
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-30 09:40:28
 * @FilePath: \cesium-secdev-set\src\components\common\index.ts
 * @Description: 全局模板插件
 */
import { App } from "vue";
// 模板组件
import CommPanel from "./CommPanel.vue";
import CommButton from "./CommButton.vue";
import CommInput from "./CommInput.vue";
import CommSlider from "./CommSlider.vue";

export default{
    install(Vue: App<Element>){
        Vue.component("CommPanel", CommPanel);  // 样式模板
        Vue.component("CommButton", CommButton);    // 按钮模板
        Vue.component("CommInput", CommInput);  // 输入框模板
        Vue.component("CommSlider", CommSlider);  // 滑块模板
    }
}