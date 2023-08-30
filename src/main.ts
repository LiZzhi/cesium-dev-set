import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// 公共组件
import CommComponents from "@/components/common";
// 公共指令
import CommDirectives from "@/directives";

// element
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// sec-dev style
import "@/secdev/assets/style"

// 引入cesium
import * as Cesium from "cesium";
import "cesium/widgets.css";
window.Cesium = Cesium;
// token
const cesiumToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmOTNiYjkwZi1iMzRlLTRjZWQtYWQxMy00MDVmMjk4YTc0YmMiLCJpZCI6MzY3MDksImlhdCI6MTY1NTE3OTc1N30.fv4nNIkCEEy3VqlaekWVcE1btEcge5_zCl_36AtusT0";
Cesium.Ion.defaultAccessToken = cesiumToken;

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(ElementPlus);

app.use(CommComponents); // 注册公共组件
app.use(CommDirectives); // 注册公共指令

app.mount("#app");
