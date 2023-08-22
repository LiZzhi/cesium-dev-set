import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import exampleRoute from "./example";
import HomeBody from "@/views/HomeBody.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: HomeBody,
    },
];

// 插入例子路由
routes.push(exampleRoute);

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes,
});

export default router;
