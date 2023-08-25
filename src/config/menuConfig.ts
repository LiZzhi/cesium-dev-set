import type { menuConfigType } from "@/type/config";

const menu:menuConfigType[] = [
    {
        label: "特效标绘",
        name: "specialEffectPlot",
        components: [
            {
                label: "普通面板点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "divPoint",
                component: () => import("@/components/example/specialEffectPlot/DivPoint.vue"),
            },
            {
                label: "简单面板点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "sampleBoardPoint",
                component: () => import("@/components/example/specialEffectPlot/SampleLabelPoint.vue"),
            },
            {
                label: "渐变面板点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "gradientBoardPoint",
                component: () => import("@/components/example/specialEffectPlot/GradientLabelPoint.vue"),
            },
            {
                label: "热点面板点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "hotspotBoardPoint",
                component: () => import("@/components/example/specialEffectPlot/HotSpotBoardPoint.vue"),
            },
            {
                label: "LED文本点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "ledLabelPoint",
                component: () => import("@/components/example/specialEffectPlot/LedLabelPoint.vue"),
            },
            {
                label: "动态文本点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "dynamicLabelPoint",
                component: () => import("@/components/example/specialEffectPlot/DynamicLabelPoint.vue"),
            },
            {
                label: "竖立文本点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "erectLabelPoint",
                component: () => import("@/components/example/specialEffectPlot/ErectLabelPoint.vue"),
            },
            {
                label: "水球点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "waterPoloPoint",
                component: () => import("@/components/example/specialEffectPlot/WaterPoloPoint.vue"),
            },
            {
                label: "闪烁点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "flickerPoint",
                component: () => import("@/components/example/specialEffectPlot/FlickerPoint.vue"),
            },
            {
                label: "浮动点",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "floatPoint",
                component: () => import("@/components/example/specialEffectPlot/FloatPoint.vue"),
            },
            {
                label: "矢量标绘",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "drawShape",
                component: () => import("@/components/example/specialEffectPlot/DrawShape.vue"),
            },
            {
                label: "聚合标绘",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "primitiveCluster",
                component: () => import("@/components/example/specialEffectPlot/PrimitiveCluster.vue"),
            },
        ],
    },
    {
        label: "相机视角",
        name: "cameraView",
        components: [
            {
                label: "路径漫游",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "pathRoaming",
                component: () => import("@/components/example/cameraView/PathRoaming.vue"),
            },
            {
                label: "视角限制",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "cameraLimit",
                component: () => import("@/components/example/cameraView/CameraLimit.vue"),
            },
        ]
    },
    {
        label: "数据可视化",
        name: "dataVisualization",
        components: [
            {
                label: "蜂巢图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "beehiveData",
                component: () => import("@/components/example/dataVisualization/BeehiveData.vue"),
            },
            {
                label: "方格图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "squareGraphData",
                component: () => import("@/components/example/dataVisualization/SquareGraphData.vue"),
            },
            {
                label: "迁徙图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "migrateData",
                component: () => import("@/components/example/dataVisualization/MigrateData.vue"),
            },
            {
                label: "大迁徙图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "bigMigrateData",
                component: () => import("@/components/example/dataVisualization/BigMigrateData.vue"),
            },
            {
                label: "热力图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "heatMapData",
                component: () => import("@/components/example/dataVisualization/HeatMapData.vue"),
            },
            {
                label: "强力边界图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "strongBoundaryData",
                component: () => import("@/components/example/dataVisualization/StrongBoundaryData.vue"),
            },
        ]
    },
    {
        label: "空间分析",
        name: "spatialAnalysis",
        components: [
            {
                label: "二三维视图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "linkView",
                component: () => import("@/components/example/spatialAnalysis/LinkView.vue"),
            },
            {
                label: "卷帘视图",
                show: true,
                img: require("@/assets/specialEffectPlot/test.jpg"),
                route: "layerSplit",
                component: () => import("@/components/example/spatialAnalysis/LayerSplit.vue"),
            },
        ]
    },
];

export default menu;