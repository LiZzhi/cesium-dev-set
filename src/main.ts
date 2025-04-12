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
// 解决 el-table Resize 问题
import "@/utils/resizeObserver";

// sec-dev style
import "@/secdev/assets/style"

// 引入第三方库
import "@/thirdParty/script";
import "@/thirdParty/style";

// 引入全局变量
import "@/utils/globalFunc"

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(ElementPlus);

app.use(CommComponents); // 注册公共组件
app.use(CommDirectives); // 注册公共指令

app.mount("#app");
