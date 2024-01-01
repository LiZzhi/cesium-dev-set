import {
    PrimitiveCollection,
    Viewer,
    Cartesian3,
    ScreenSpaceEventHandler,
    CustomDataSource,
    Appearance,
    GroundPolylinePrimitive,
    Color,
    GeometryInstance,
    GroundPrimitive,
} from "cesium";
import mouseMessageBox from "../../utils/mouseMessageBox";
import uuid from "@/utils/uuid";

type polylineCallBackType = (p: GroundPolylinePrimitive) => void;
type polygonCallBackType = (p: PrimitiveCollection) => void;
export type emergencyPolylineOptionsType = {
    width: number; // 线宽
    loop: boolean; // 是否守尾连接
    appearance: Appearance; // 外观
};
export type emergencyPolygonOptionsType = {
    outline?: boolean; // 是否有轮廓线
    outlineWidth?: number; // 轮廓线宽
    outlineAppearance?: Appearance; // 轮廓线材质
    fill?: boolean; // 是否有填充
    fillAppearance?: Appearance; // 填充材质
    maxNode?: number; // 最大节点数量
};

export default class drawEmergency {
    #viewer: Viewer;
    #primitives: PrimitiveCollection;
    #drawNodeSource: CustomDataSource;
    #pointNodePosiArr: Cartesian3[];
    #isDepth: boolean;
    #handler: ScreenSpaceEventHandler | undefined;
    #messageBox: mouseMessageBox;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        // drawEmergency 类单独使用的 PrimitiveCollection
        this.#primitives = new Cesium.PrimitiveCollection({
            destroyPrimitives: false,
        });
        viewer.scene.primitives.add(this.#primitives);
        // drawEmergency 类记录临时节点的 dataSource
        this.#drawNodeSource = new Cesium.CustomDataSource(
            "emergency-node-" + uuid()
        );
        viewer.dataSources.add(this.#drawNodeSource);
        // 绘图过程中，临时记录的节点 Cartesian3 的数组
        this.#pointNodePosiArr = [];
        // 记录当前深度检测状态
        this.#isDepth = viewer.scene.globe.depthTestAgainstTerrain;
        // 屏幕事件句柄
        this.#handler = undefined;
        // 提示dom
        this.#messageBox = new mouseMessageBox(viewer);
    }

    /**
     * @description: 绘制primitive线
     * @param {emergencyPolylineOptionsType} options
     * @param {polylineCallBackType} end
     * @return {*}
     */
    drawPolyline(
        options: emergencyPolylineOptionsType,
        end: polylineCallBackType
    ) {
        const { width, loop, appearance } = options;
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        let primitive: GroundPolylinePrimitive;
        let that = this;
        function updatePolyline() {
            let geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: that.#pointNodePosiArr,
                    arcType: Cesium.ArcType.RHUMB,
                    width: width,
                    loop: loop,
                }),
            });
            if (!primitive) {
                // 临时绘图线
                primitive = new Cesium.GroundPolylinePrimitive({
                    geometryInstances: geometryInstances,
                    appearance: appearance,
                    asynchronous: false, // 必须同步,异步会出现抖动
                });
                that.#primitives.add(primitive);
            } else {
                // 更新临时绘图线
                // 此处原理为参考 https://github.com/CesiumGS/cesium/blob/1.72/Source/Scene/GroundPolylinePrimitive.js#L710
                // 源码第710行，当_primitive为undefined时，update就会重新创建
                // @ts-ignore
                primitive._primitive = undefined;
                // @ts-ignore
                primitive.geometryInstances = [geometryInstances];
            }
        }
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);
            if (Cesium.defined(position)) {
                // 添加节点
                this.#addTemporaryPoint(position);
                this.#messageBox.changeMessage("单击继续绘制，右击结束绘制");
                if (this.#pointNodePosiArr.length >= 2) {
                    updatePolyline();
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 鼠标移动事件
            let position = this.#viewer.scene.pickPosition(e.endPosition);
            // 移动点跟着光标动
            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length === 1) {
                    this.#pointNodePosiArr.push(position);
                }
                if (this.#pointNodePosiArr.length >= 2) {
                    // 更新最新鼠标点
                    this.#pointNodePosiArr.pop();
                    this.#pointNodePosiArr.push(position);
                    updatePolyline();
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 2) {
                end(primitive);
                this.#primitives.remove(primitive);
            }
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    drawPolygon(
        options: emergencyPolygonOptionsType,
        end: polygonCallBackType
    ) {
        options = Object.assign(
            {
                maxNode: Number.POSITIVE_INFINITY,
                outline: false,
                fill: true,
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        let polylinePrimitive: GroundPolylinePrimitive;
        let polygonPrimitive: GroundPrimitive;
        let that = this;
        function updatePolyline() {
            if (!options.outline) {
                return;
            }
            let geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: that.#pointNodePosiArr,
                    arcType: Cesium.ArcType.RHUMB,
                    width: options.outlineWidth,
                    loop: true,
                }),
            });
            if (!polylinePrimitive) {
                // 临时绘图线
                polylinePrimitive = new Cesium.GroundPolylinePrimitive({
                    geometryInstances: geometryInstances,
                    appearance: options.outlineAppearance,
                    asynchronous: false, // 必须同步,异步会出现抖动
                });
                that.#primitives.add(polylinePrimitive);
            } else {
                // 更新临时绘图线
                // 此处原理为参考 https://github.com/CesiumGS/cesium/blob/1.72/Source/Scene/GroundPolylinePrimitive.js#L710
                // 源码第710行，当_primitive为undefined时，update就会重新创建
                // @ts-ignore
                polylinePrimitive._primitive = undefined;
                // @ts-ignore
                polylinePrimitive.geometryInstances = [geometryInstances];
            }
        }
        function updatePolygon() {
            if (!options.fill) {
                return;
            }
            let geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(that.#pointNodePosiArr),
                    arcType: Cesium.ArcType.RHUMB,
                }),
            });
            if (!polygonPrimitive) {
                // 临时绘图线
                polygonPrimitive = new Cesium.GroundPrimitive({
                    geometryInstances: geometryInstances,
                    appearance: options.fillAppearance,
                    asynchronous: false, // 必须同步,异步会出现抖动
                });
                that.#primitives.add(polygonPrimitive);
            } else {
                // 更新临时绘图线
                // 此处原理为参考 https://github.com/CesiumGS/cesium/blob/1.72/Source/Scene/GroundPolylinePrimitive.js#L710
                // 源码第710行，当_primitive为undefined时，update就会重新创建
                // @ts-ignore
                polygonPrimitive._primitive = undefined;
                // @ts-ignore
                polygonPrimitive.geometryInstances = [geometryInstances];
            }
        }
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);
            if (Cesium.defined(position)) {
                if(this.#pointNodePosiArr.length >= (options.maxNode || Number.POSITIVE_INFINITY)){
                    // 超出节点限制结束绘图
                    if (this.#pointNodePosiArr.length >= 3) {
                        let primitives = new Cesium.PrimitiveCollection();
                        polylinePrimitive && primitives.add(polylinePrimitive);
                        polygonPrimitive && primitives.add(polygonPrimitive);
                        end(primitives);
                        this.#primitives.remove(polylinePrimitive);
                        this.#primitives.remove(polygonPrimitive);
                    }
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);
                this.#messageBox.changeMessage("单击继续绘制，右击结束绘制");
                if (this.#pointNodePosiArr.length >= 2) {
                    updatePolyline();
                }
                if (this.#pointNodePosiArr.length >= 3) {
                    updatePolygon();
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 鼠标移动事件
            let position = this.#viewer.scene.pickPosition(e.endPosition);
            // 移动点跟着光标动
            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length === 1) {
                    this.#pointNodePosiArr.push(position);
                    updatePolyline();
                }
                if (this.#pointNodePosiArr.length >= 2) {
                    // 更新最新鼠标点
                    this.#pointNodePosiArr.pop();
                    this.#pointNodePosiArr.push(position);
                    updatePolyline();
                    updatePolygon();
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 3) {
                let primitives = new Cesium.PrimitiveCollection();
                polylinePrimitive && primitives.add(polylinePrimitive);
                polygonPrimitive && primitives.add(polygonPrimitive);
                end(primitives);
                this.#primitives.remove(polylinePrimitive);
                this.#primitives.remove(polygonPrimitive);
            }
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * @description: 销毁
     * @return {*}
     */
    destroy() {
        this.#drawEnd();
        this.#viewer.dataSources.remove(this.#drawNodeSource);
        this.#viewer.scene.primitives.remove(this.#primitives);
    }

    /**
     * 绘图前准备工作
     * @returns {ScreenSpaceEventHandler} 屏幕事件句柄
     */
    #drawStart(): ScreenSpaceEventHandler {
        // 开始绘图前先清除上次绘图的状态
        this.#drawEnd();
        // 修改鼠标样式
        window.document.body.style.cursor = "crosshair";
        // 获取屏幕事件句柄
        let handler = new Cesium.ScreenSpaceEventHandler(this.#viewer.canvas);
        // 开启深度探测
        if (!this.#isDepth) {
            this.#isDepth = this.#viewer.scene.globe.depthTestAgainstTerrain;
            this.#viewer.scene.globe.depthTestAgainstTerrain = true;
            console.log("%c自动开启深度检测！", "color: #43bb88;");
        }
        return handler;
    }

    /**
     * 绘图完毕的清除工作
     */
    #drawEnd(): void {
        // 销毁消息盒子
        this.#messageBox.destroy();
        // 恢复鼠标样式
        window.document.body.style.cursor = "auto";
        // 恢复深度检测状态
        this.#viewer.scene.globe.depthTestAgainstTerrain = this.#isDepth;
        // 销毁事件句柄
        if (this.#handler && !this.#handler.isDestroyed()) {
            this.#handler.destroy();
            this.#handler = undefined;
        }
        // 销毁当前临时绘图的节点 Entity
        this.#drawNodeSource.entities.removeAll();
        // 清空当前临时绘图的节点坐标数组
        this.#pointNodePosiArr.length = 0;
    }

    /**
     * 添加临时绘图节点
     * @param { Cartesian3 } position 节点坐标
     */
    #addTemporaryPoint(position: Cartesian3): void {
        this.#drawNodeSource.entities.add({
            position: position,
            point: {
                pixelSize: 6,
                color: Cesium.Color.WHITE,
            },
        });
        this.#pointNodePosiArr.push(position);
    }
}
