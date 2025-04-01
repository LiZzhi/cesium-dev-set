import {
    Entity,
    Viewer,
    TimeIntervalCollection,
    Cartesian3,
    TimeIntervalCollectionProperty,
    EntityView,
    JulianDate,
} from "cesium";
import ExtendSampledPositionProperty from "./ExtendSampledPositionProperty";

export type sampleEntityDataType = {
    position: Cartesian3;
    object?: any;
};

export default class {
    viewer: Viewer;
    entity: Entity;
    position: ExtendSampledPositionProperty;
    linePositions: Cartesian3[];
    properties: TimeIntervalCollectionProperty;
    messageData: sampleEntityDataType[];
    entityView: EntityView;
    track: boolean;
    lastTime: JulianDate;
    constructor(viewer: Viewer) {
        this.viewer = viewer;
        // Entity
        this.entity = new Cesium.Entity();
        // 位置
        this.position = new ExtendSampledPositionProperty();
        // 轨迹坐标
        this.linePositions = [];
        // 数据，为了更灵活的读取，此处采用分别记录索引和元数据
        this.properties = new Cesium.TimeIntervalCollectionProperty();
        this.messageData = [];
        // 跟踪
        this.entityView = new Cesium.EntityView(this.entity, this.viewer.scene);
        this.track = false;
        // 最后时间
        this.lastTime = this.viewer.clock.currentTime.clone();
    }

    init() {
        this.createEntity();
        this.tracking();
    }

    destroy() {
        this.viewer.entities.remove(this.entity);
        this.entity = new Cesium.Entity();
        this.position = new ExtendSampledPositionProperty();
        this.linePositions = [];
        this.properties = new Cesium.TimeIntervalCollectionProperty();
        this.messageData = [];
        this.entityView = new Cesium.EntityView(this.entity, this.viewer.scene);
        this.track = false;
        this.lastTime = this.viewer.clock.currentTime.clone();
    }

    getData(
        time = this.viewer.clock.currentTime
    ): sampleEntityDataType | undefined {
        return this.messageData[this.properties.getValue(time)];
    }

    changeView(bool: boolean) {
        this.track = bool;
    }

    changeAnimate(bool: boolean) {
        this.viewer.clock.shouldAnimate = bool;
    }

    // 创建Entity
    createEntity() {
        let preTime = Cesium.JulianDate.now();
        this.entity = this.viewer.entities.add({
            position: this.position,
            show: true,
            viewFrom: new Cesium.ConstantProperty(
                () => new Cesium.Cartesian3(-400, -405, 409)
            ),
            model: {
                uri: require("../assets/gltf/uav.glb"),
                scale: 0.5,
                minimumPixelSize: 10,
                maximumScale: 10000,
                heightReference: Cesium.HeightReference.NONE,
                show: true,
            },
            label: {
                text: "无人机",
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 10000, 0.6),
                pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                    0,
                    1.5,
                    10000,
                    0
                ),
                outlineColor:
                    Cesium.Color.fromCssColorString("rgb(16, 161, 214)"),
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor:
                    Cesium.Color.fromCssColorString(
                        "rgb(16, 161, 214)"
                    ).withAlpha(0.7), //字体颜色
                fillColor: Cesium.Color.fromCssColorString("#fff"), //字体颜色
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0, -20),
            },
            polyline: {
                positions: new Cesium.CallbackProperty((time) => {
                    let nowPosi = this.position.getValue(time);
                    if (nowPosi) {
                        // 视角跟随
                        this.track &&
                            this.entityView &&
                            this.entityView.update(
                                time,
                                new Cesium.BoundingSphere(nowPosi, 1300)
                            );
                        // 添加轨迹线，一秒一加
                        if (
                            Cesium.JulianDate.secondsDifference(
                                time,
                                preTime
                            ) >= 1
                        ) {
                            let prePosition = this.position.getValue(preTime);
                            if (prePosition && !nowPosi.equals(prePosition)) {
                                this.linePositions.push(nowPosi);
                            }
                            preTime = time;
                        }
                    }
                    return this.linePositions;
                }, false),
                width: 3.0,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.fromCssColorString("rgb(47,224,50)"),
                }),
            },
            properties: {
                population_intervals: this.properties,
            },
        });
    }

    /**
     * @description: 添加数据
     * @param {number} seconds 前一位置到当前位置所需时间(秒)
     * @param {sampleEntityDataType} data 数据
     * @return {*}
     */
    addData(seconds: number, data: sampleEntityDataType) {
        let start = JulianDate.now();
        let stop = JulianDate.now();
        // 计算当前时间是否已超过最后一个点位，若是，则计时从当前时间算起，否则从最后一个点位的时间进行追加
        let useLast = Cesium.JulianDate.greaterThanOrEquals(
            start,
            this.lastTime
        );
        if (useLast) {
            this.lastTime = start.clone();
        } else {
            start = this.lastTime.clone();
            // 对于不是追加的情况，位置应有一段时间不动的情况
            let prePosition = this.position.getValue(start);
            if (prePosition) {
                this.position.addSample(start, prePosition);
            }
            console.log(start, "start");
            console.log(prePosition, "prePosition");

        }
        // 添加当前点位数据
        Cesium.JulianDate.addSeconds(this.lastTime, seconds, this.lastTime);
        console.log(this.lastTime, "this.lastTime");
        console.log(data.position, "data.position");
        stop = this.lastTime.clone();
        this.position.addSample(stop, data.position);
        this.messageData.push(data);
        this.properties.intervals.addInterval(
            Cesium.TimeInterval.fromIso8601({
                iso8601: `${Cesium.JulianDate.toIso8601(
                    start
                )}/${Cesium.JulianDate.toIso8601(stop)}`,
                isStartIncluded: true,
                isStopIncluded: false,
                data: this.messageData.length - 1,
            })
        );
    }

    // 跟随
    tracking() {
        this.entityView = new Cesium.EntityView(this.entity, this.viewer.scene);
    }
}
