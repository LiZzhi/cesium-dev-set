import { App } from "vue";
// 模板组件
import CommPanel from "./CommPanel.vue";
import CommButton from "./CommButton.vue";
import CommInput from "./CommInput.vue";

export default{
    install(Vue: App<Element>){
        Vue.component("CommPanel", CommPanel);  // 样式模板
        Vue.component("CommButton", CommButton);    // 按钮模板
        Vue.component("CommInput", CommInput);  // 输入框模板
    }
}