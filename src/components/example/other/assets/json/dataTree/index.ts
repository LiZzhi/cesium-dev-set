import { originDataType } from "@/hooks/useDataTree";

const data: originDataType[] = [
    {
        label: "底图资源",
        itemType: "folder",
        children: [
            {
                label: "影像底图",
                itemType: "data",
                defaultCheck: true,
                singleChoice: true,
                singleSymbol: "layer",
                data: {
                    type: "layer",
                    options: {
                        url:
                            "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                            window.$config.token.TIANDITU_TOKEN,
                        layer: "tdtBasicLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                    },
                },
            },
            {
                label: "矢量底图",
                itemType: "data",
                singleChoice: true,
                singleSymbol: "layer",
                data: {
                    type: "layer",
                    options: {
                        url:
                            "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
                            window.$config.token.TIANDITU_TOKEN,
                        layer: "tdtVecBasicLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                    },
                },
            },
        ],
    },
    {
        label: "注记资源",
        itemType: "folder",
        children: [
            {
                label: "影像注记",
                itemType: "data",
                defaultCheck: true,
                singleChoice: true,
                singleSymbol: "anno",
                data: {
                    type: "anno",
                    options: {
                        url:
                            "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                            window.$config.token.TIANDITU_TOKEN,
                        layer: "tdtAnnoLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                    },
                },
            },
            {
                label: "矢量注记",
                itemType: "data",
                singleChoice: true,
                singleSymbol: "anno",
                data: {
                    type: "anno",
                    options: {
                        url:
                            "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                            window.$config.token.TIANDITU_TOKEN,
                        layer: "tdtAnnoLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                    },
                },
            },
        ],
    },
    // {
    //     label: "地形资源",
    //     itemType: "folder",
    //     children: [
    //         {
    //             label: "默认地形",
    //             itemType: "data",
    //             singleChoice: true,
    //             singleSymbol: "terrain",
    //             data: {
    //                 type: "terrain",
    //                 url: Cesium.IonResource.fromAssetId(3956),
    //             },
    //         },
    //         {
    //             label: "星图地形",
    //             itemType: "data",
    //             singleChoice: true,
    //             singleSymbol: "terrain",
    //             data: {
    //                 type: "terrain",
    //                 url: `https://tiles.geovis.online/base/v1/terrain?token=${window.$config.token.GEOVIS_TOKEN}`,
    //             },
    //         },
    //     ],
    // },
    {
        label: "凤城市区划",
        itemType: "folder",
        defaultExpand: true,
        children: [
            {
                label: "爱阳镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/爱阳镇.json"),
                },
            },
            {
                label: "白旗镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/白旗镇.json"),
                },
            },
            {
                label: "宝山镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/宝山镇.json"),
                },
            },
            {
                label: "边门镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/边门镇.json"),
                },
            },
            {
                label: "草河街道",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/草河街道.json"),
                },
            },
            {
                label: "大堡蒙古族乡",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/大堡蒙古族乡.json"),
                },
            },
            {
                label: "大兴镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/大兴镇.json"),
                },
            },
            {
                label: "弟兄山镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/弟兄山镇.json"),
                },
            },
            {
                label: "东汤镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/东汤镇.json"),
                },
            },
            {
                label: "凤凰城街道",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/凤凰城街道.json"),
                },
            },
            {
                label: "凤山街道",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/凤山街道.json"),
                },
            },
            {
                label: "红旗镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/红旗镇.json"),
                },
            },
            {
                label: "鸡冠山镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/鸡冠山镇.json"),
                },
            },
            {
                label: "蓝旗镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/蓝旗镇.json"),
                },
            },
            {
                label: "刘家河镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/刘家河镇.json"),
                },
            },
            {
                label: "青城子镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/青城子镇.json"),
                },
            },
            {
                label: "赛马镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/赛马镇.json"),
                },
            },
            {
                label: "沙里寨镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/沙里寨镇.json"),
                },
            },
            {
                label: "石城镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/石城镇.json"),
                },
            },
            {
                label: "四门子镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/四门子镇.json"),
                },
            },
            {
                label: "通元堡镇",
                itemType: "data",
                defaultCheck: true,
                data: {
                    type: "geojson",
                    data: require("./towns/通元堡镇.json"),
                },
            },
        ],
    },
];

export default data;
