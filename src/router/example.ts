import menuConfig from "@/config/menuConfig";
import { RouteRecordRaw } from "vue-router";

// 例子路由
const exampleRoute:RouteRecordRaw = {
    path: "/example",
    name: "example",
    component: () => import("@/views/ExampleBody.vue"),
    children: [],
};

// 插入子路由
menuConfig.forEach(v => {
    v.components.forEach(r => {
        exampleRoute.children.push({
            path: r.route,
            name: r.route,
            component: r.component,
        })
    })
})

export default exampleRoute;