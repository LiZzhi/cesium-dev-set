import type { menuConfigType } from "@/type/config";

const menu:menuConfigType[] = [
    {
        label: "特效标绘",
        name: "specialEffectPlot",
        components: [
            {
                label: "矢量标绘",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/drawShape.png"),
                route: "drawShape",
                component: () => import("@/components/example/specialEffectPlot/DrawShape.vue"),
            },
            {
                label: "聚合标绘",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/primitiveCluster.png"),
                route: "primitiveCluster",
                component: () => import("@/components/example/specialEffectPlot/PrimitiveCluster.vue"),
            },
            {
                label: "广告牌点",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/boardPoint.png"),
                route: "boardPoint",
                component: () => import("@/components/example/specialEffectPlot/BoardPoint.vue"),
            },
            {
                label: "文本点",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/labelPoint.png"),
                route: "labelPoint",
                component: () => import("@/components/example/specialEffectPlot/LabelPoint.vue"),
            },
            {
                label: "特效点",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/effectPoint.png"),
                route: "effectPoint",
                component: () => import("@/components/example/specialEffectPlot/EffectPoint.vue"),
            },
            {
                label: "特效线",
                show: true,
                img: require("@/assets/cover/specialEffectPlot/effectLine.png"),
                route: "effectLine",
                component: () => import("@/components/example/specialEffectPlot/EffectLine.vue"),
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
                img: require("@/assets/cover/cameraView/pathRoaming.png"),
                route: "pathRoaming",
                component: () => import("@/components/example/cameraView/PathRoaming.vue"),
            },
            {
                label: "视角限制",
                show: true,
                img: require("@/assets/cover/cameraView/cameraLimit.png"),
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
                img: require("@/assets/cover/dataVisualization/beehiveData.png"),
                route: "beehiveData",
                component: () => import("@/components/example/dataVisualization/BeehiveData.vue"),
            },
            {
                label: "方格图",
                show: true,
                img: require("@/assets/cover/dataVisualization/squareGraphData.png"),
                route: "squareGraphData",
                component: () => import("@/components/example/dataVisualization/SquareGraphData.vue"),
            },
            {
                label: "迁徙图",
                show: true,
                img: require("@/assets/cover/dataVisualization/migrateData.png"),
                route: "migrateData",
                component: () => import("@/components/example/dataVisualization/MigrateData.vue"),
            },
            {
                label: "大迁徙图",
                show: true,
                img: require("@/assets/cover/dataVisualization/bigMigrateData.png"),
                route: "bigMigrateData",
                component: () => import("@/components/example/dataVisualization/BigMigrateData.vue"),
            },
            {
                label: "热力图",
                show: true,
                img: require("@/assets/cover/dataVisualization/heatMapData.png"),
                route: "heatMapData",
                component: () => import("@/components/example/dataVisualization/HeatMapData.vue"),
            },
            {
                label: "强力边界图",
                show: true,
                img: require("@/assets/cover/dataVisualization/strongBoundaryData.png"),
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
                label: "测量工具",
                show: true,
                img: require("@/assets/cover/spatialAnalysis/measureTool.png"),
                route: "measureTool",
                component: () => import("@/components/example/spatialAnalysis/MeasureTool.vue"),
            },
            {
                label: "二三维视图",
                show: true,
                img: require("@/assets/cover/spatialAnalysis/linkView.png"),
                route: "linkView",
                component: () => import("@/components/example/spatialAnalysis/LinkView.vue"),
            },
            {
                label: "卷帘视图",
                show: true,
                img: require("@/assets/cover/spatialAnalysis/layerSplit.png"),
                route: "layerSplit",
                component: () => import("@/components/example/spatialAnalysis/LayerSplit.vue"),
            },
        ]
    },
];

export default menu;