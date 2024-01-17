import { Viewer, PolygonHierarchy, Cartesian3, Entity } from "cesium";
import cartographicTool from "../utils/cartographicTool";
import deepClone from "@/utils/deepClone";

export type dataValueType = {
    lon: number;
    lat: number;
    value: number;
};

export type dataListType = {
    lons: number[];
    lats: number[];
    siteValue: number[];
}

export type colorsType = {
    min: number;
    max: number;
    color: string;
}

export default class krigingInterpolation {
    #canvas: HTMLCanvasElement;
    #polygon: number[][][];
    #extent: Cartesian3[];
    e: Entity;
    constructor(polygon: number[][][]) {
        this.#canvas = this.createCanvas();
        this.#polygon = deepClone(polygon);
        this.#extent = cartographicTool.toCartesian3S(this.#polygon[0]);
        this.e = new Cesium.Entity({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(
                    this.#extent,
                    this.#polygon.slice(1).map((v)=>{
                        return new Cesium.PolygonHierarchy(
                            cartographicTool.toCartesian3S(v)
                        )
                    })

                ),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        })
    }

    create(values: dataValueType[], colors: colorsType[]) {
        this.update(values, colors);
        return this.e;
    }

    update(values: dataValueType[], colors: colorsType[]){
        let data = this.preprocessingData(values);
        console.log('start', new Date().getMinutes() + ',' + new Date().getSeconds());
        this.changeCanvas(
            data,
            new Cesium.PolygonHierarchy(this.#extent),
            colors
        );
        console.log('end', new Date().getMinutes() + ',' + new Date().getSeconds());
        this.e.polygon!.material = new Cesium.ImageMaterialProperty({
            image: this.#canvas
        })
    }

    createCanvas() {
        let canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.display = "block";
        canvas.getContext("2d")!.globalAlpha = 1; //设置透明度
        return canvas;
    }

    changeCanvas(data: dataListType, hierarchy: PolygonHierarchy, colors: colorsType[]) {
        let extent = Cesium.PolygonGeometry.computeRectangle({
            polygonHierarchy: hierarchy,
        });
        let minx = Cesium.Math.toDegrees(extent.west);
        let miny = Cesium.Math.toDegrees(extent.south);
        let maxx = Cesium.Math.toDegrees(extent.east);
        let maxy = Cesium.Math.toDegrees(extent.north);

        const kriging = require("@/secdev/utils/kriging.js").default;

        //1.用克里金训练一个variogram对象
        let variogram = kriging.train(
            data.siteValue,
            data.lons,
            data.lats,
            "exponential",
            0,
            100
        );
        //2.使用刚才的variogram对象使polygons描述的地理位置内的格网元素具备不一样的预测值；
        let grid = kriging.grid(
            this.#polygon,
            variogram,
            (maxy - miny) / 1000
        );
        //3.将得到的格网预测值渲染到canvas画布上
        kriging.plot(
            this.#canvas,
            grid,
            [minx, maxx],
            [miny, maxy],
            colors
        );
    }

    preprocessingData(values: dataValueType[]) {
        let lons: number[] = [];
        let lats: number[] = [];
        let siteValue: number[] = [];
        values.map((item) => {
            lons.push(item.lon);
            lats.push(item.lat);
            siteValue.push(item.value);
        });
        return {
            lons,
            lats,
            siteValue,
        };
    }
}
