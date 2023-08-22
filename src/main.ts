import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// 模板组件
import CommPanel from "@/components/common/CommPanel.vue";

// element
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// 引入cesium
import * as Cesium from "cesium";
import "cesium/widgets.css";
import "@/secdev/assets/style"
window.Cesium = Cesium;


const app = createApp(App);

app.use(router);
app.use(createPinia());

app.component("CommPanel", CommPanel); // 样式模板

app.use(ElementPlus);

app.mount("#app");
