/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2023-12-28 21:25:34
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-19 14:33:05
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\plot\drawPrimitive.ts
 * @Description: 绘制primitive
 */
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
import mathExtend from "@/secdev/utils/mathExtend";
import uuid from "@/utils/uuid";
import cartographicTool from "@/secdev/utils/cartographicTool";

type polylineCallBackType = (p: GroundPolylinePrimitive) => void;
type polygonCallBackType = (p: PrimitiveCollection) => void;
type realPointsType = {
    mainLinePositions: Cartesian3[];
    wallPositions: Cartesian3[];
};
type computePointsType = (p: Cartesian3[]) => realPointsType | false;
export type polylineOptionsType = {
    width: number; // 线宽
    loop: boolean; // 是否守尾连接
    appearance: Appearance; // 外观
};
export type polygonOptionsType = {
    outline?: boolean; // 是否有轮廓线
    outlineWidth?: number; // 轮廓线宽
    outlineAppearance?: Appearance; // 轮廓线材质
    fill?: boolean; // 是否有填充
    fillAppearance?: Appearance; // 填充材质
    maxNode?: number; // 最大节点数量
};

export default class drawPrimitive {
    #viewer: Viewer;
    #primitives: PrimitiveCollection;
    #drawNodeSource: CustomDataSource;
    #pointNodePosiArr: Cartesian3[];
    #isDepth: boolean;
    #handler: ScreenSpaceEventHandler | undefined;
    #messageBox: mouseMessageBox;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        // drawPrimitive 类单独使用的 PrimitiveCollection
        this.#primitives = new Cesium.PrimitiveCollection({
            destroyPrimitives: false,
        });
        viewer.scene.primitives.add(this.#primitives);
        // drawPrimitive 类记录临时节点的 dataSource
        this.#drawNodeSource = new Cesium.CustomDataSource(
            "primitive-node-" + uuid()
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
     * @param {polylineOptionsType} options
     * @param {polylineCallBackType} end
     * @return {*}
     */
    drawPolyline(options: polylineOptionsType, end: polylineCallBackType) {
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

    /**
     * @description: 绘制primitive多边形
     * @param {polygonOptionsType} options
     * @param {polygonCallBackType} end
     * @return {*}
     */
    drawPolygon(options: polygonOptionsType, end: polygonCallBackType) {
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
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                        that.#pointNodePosiArr
                    ),
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
                if (
                    this.#pointNodePosiArr.length >=
                    (options.maxNode || Number.POSITIVE_INFINITY)
                ) {
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
     * @description: 绘制集结区
     * @param {polygonCallBackType} end
     * @return {*}
     */
    drawStagingArea(end: polygonCallBackType) {
        function computeShapePoints(positions: Cartesian3[]) {
            let coords = cartographicTool.formCartesian3S(positions, {
                z: false,
            });
            let milStdPosition: number[] = [];
            let pb = mathExtend.lineType_3_0_0(coords);
            if (!pb) {
                return false;
            }
            let arrowCoordinates = mathExtend.computeBeizerPts(pb!);
            arrowCoordinates.forEach((v) => {
                milStdPosition.push(v[0]);
                milStdPosition.push(v[1]);
            });
            let mainLinePositions: Cartesian3[] = [];
            for (let i = 0; i < milStdPosition.length; i += 2) {
                mainLinePositions.push(
                    Cartesian3.fromDegrees(
                        milStdPosition[i],
                        milStdPosition[i + 1]
                    )
                );
            }

            let wallPositions = Cartesian3.fromDegreesArray(milStdPosition);
            return {
                mainLinePositions,
                wallPositions,
            };
        }
        this.drawMilStd(computeShapePoints, end, {
            maxNode: 3,
        });
    }

    /**
     * @description: 绘制钳击箭头
     * @param {polygonCallBackType} end
     * @return {*}
     */
    drawPincerArrow(end: polygonCallBackType) {
        function computeShapePoints(positions: Cartesian3[]) {
            let tGeoAttr2D = cartographicTool.formCartesian3S(positions, {
                z: false,
            });
            let milStdPosition: number[] = [];
            let arrowCoordinates: number[][] = [];
            if (tGeoAttr2D.length === 2) {
                let p3 = mathExtend.pointRotate(
                    tGeoAttr2D[1],
                    tGeoAttr2D[0],
                    -50
                );
                let p4 = mathExtend.pointRotate(
                    tGeoAttr2D[0],
                    tGeoAttr2D[1],
                    50
                );
                if (p3.concat(p4).includes(NaN)) {
                    return false;
                }
                arrowCoordinates = mathExtend.drawArrow(
                    tGeoAttr2D[0],
                    tGeoAttr2D[1],
                    p3,
                    p4
                );
            } else if (tGeoAttr2D.length === 3) {
                let p1 = tGeoAttr2D[0];
                let p2 = tGeoAttr2D[1];
                let p3 = tGeoAttr2D[2];

                let L = Math.sqrt(
                    (p1[0] - p2[0]) * (p1[0] - p2[0]) +
                        (p1[1] - p2[1]) * (p1[1] - p2[1])
                );
                let L1 = Math.sqrt(
                    (p3[0] - p2[0]) * (p3[0] - p2[0]) +
                        (p3[1] - p2[1]) * (p3[1] - p2[1])
                );
                let y = p2[0] - p1[0];
                let x = p2[1] - p1[1];

                let angle1 = mathExtend.getRotateAngle(p2, p1, p3);
                if (mathExtend.judgePointPos(p3, p1, p2) > 0) {
                    angle1 *= -1;
                }
                let scale1 = (L1 * Math.sin(angle1)) / L;
                let scale2 = -(L1 * Math.cos(angle1)) / L;
                let p4 = [
                    p1[0] - y * scale2 - x * scale1,
                    p1[1] - x * scale2 + y * scale1,
                ];
                if (p1.concat(p2, p3, p4).includes(NaN)) {
                    return false;
                }

                arrowCoordinates = mathExtend.drawArrow(p1, p2, p3, p4);
            } else if (tGeoAttr2D.length === 4) {
                arrowCoordinates = mathExtend.drawArrow(
                    tGeoAttr2D[0],
                    tGeoAttr2D[1],
                    tGeoAttr2D[2],
                    tGeoAttr2D[3]
                );
            }

            arrowCoordinates.forEach((v) => {
                milStdPosition.push(v[0]);
                milStdPosition.push(v[1]);
            });

            let mainLinePositions: Cartesian3[] = [];
            for (let i = 0; i < milStdPosition.length; i += 2) {
                mainLinePositions.push(
                    Cartesian3.fromDegrees(
                        milStdPosition[i],
                        milStdPosition[i + 1]
                    )
                );
            }

            let wallPositions = Cartesian3.fromDegreesArray(milStdPosition);
            return {
                mainLinePositions,
                wallPositions,
            };
        }
        this.drawMilStd(computeShapePoints, end, {
            maxNode: 4,
        });
    }

    /**
     * @description: 绘制单箭头
     * @param {polygonCallBackType} end
     * @return {*}
     */
    drawSingleArrow(end: polygonCallBackType) {
        function computeShapePoints(positions: Cartesian3[]) {
            let coords = cartographicTool.formCartesian3S(positions, {
                z: false,
            });
            let milStdPosition: number[] = [];
            let arrowCoordinates: number[][] =
                mathExtend.computeShapePoints(coords);
            arrowCoordinates.forEach((v) => {
                milStdPosition.push(v[0]);
                milStdPosition.push(v[1]);
            });
            let mainLinePositions: Cartesian3[] = [];
            for (let i = 0; i < milStdPosition.length; i += 2) {
                mainLinePositions.push(
                    Cartesian3.fromDegrees(
                        milStdPosition[i],
                        milStdPosition[i + 1]
                    )
                );
            }

            let wallPositions = Cartesian3.fromDegreesArray(milStdPosition);
            return {
                mainLinePositions,
                wallPositions,
            };
        }
        this.drawMilStd(computeShapePoints, end);
    }

    /**
     * @description: 绘制直箭头
     * @param {polygonCallBackType} end
     * @return {*}
     */
    drawStraightArrow(end: polygonCallBackType) {
        function computeShapePoints(positions: Cartesian3[]) {
            let degrees = cartographicTool.formCartesian3S(positions, {
                z: false,
            });

            let newDegrees = mathExtend.straightArrowPositions(degrees, {
                tailWidthFactor: 0.15,
                neckWidthFactor: 0.2,
                headWidthFactor: 0.25,
                headAngle: Math.PI / 8.5,
                neckAngle: Math.PI / 13,
            })

            let ps = cartographicTool.toCartesian3S(newDegrees);
            return {
                mainLinePositions: ps,
                wallPositions: ps,
            }
        };

        this.drawMilStd(computeShapePoints, end, {
            maxNode: 2,
        });
    }

    /**
     * @description: 自定义绘制
     * @param {computePointsType} computePoints 真实上图点位
     * @param {polygonCallBackType} end
     * @param {polygonOptionsType} options
     * @return {*}
     */
    drawMilStd(
        computePoints: computePointsType,
        end: polygonCallBackType,
        options?: polygonOptionsType
    ) {
        options = Object.assign(
            {
                outline: true,
                outlineWidth: 3,
                outlineAppearance: new Cesium.PolylineMaterialAppearance({
                    material: new Cesium.Material({
                        fabric: {
                            type: "Color",
                            uniforms: {
                                color: Cesium.Color.RED,
                            },
                        },
                    }),
                }),
                fill: true,
                fillAppearance: new Cesium.MaterialAppearance({
                    material: new Cesium.Material({
                        fabric: {
                            type: "Color",
                            uniforms: {
                                color: Cesium.Color.RED.withAlpha(0.4),
                            },
                        },
                    }),
                }),
                maxNode: Number.POSITIVE_INFINITY,
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        let polylinePrimitive: GroundPolylinePrimitive;
        let polygonPrimitive: GroundPrimitive;
        let realFillNode: Cartesian3[] = [];
        let realLineNode: Cartesian3[] = [];
        let that = this;
        function updatePolyline() {
            if (!options?.outline) {
                return;
            }
            let geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: realLineNode,
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
            if (!options?.fill) {
                return;
            }
            let geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(realFillNode),
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
                if (
                    this.#pointNodePosiArr.length >=
                    (options?.maxNode || Number.POSITIVE_INFINITY)
                ) {
                    // 超出节点限制结束绘图
                    let primitives = new Cesium.PrimitiveCollection();
                    polylinePrimitive && primitives.add(polylinePrimitive);
                    polygonPrimitive && primitives.add(polygonPrimitive);
                    end(primitives);
                    this.#primitives.remove(polylinePrimitive);
                    this.#primitives.remove(polygonPrimitive);
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);
                this.#messageBox.changeMessage("单击继续绘制，右击结束绘制");
                if (this.#pointNodePosiArr.length >= 2) {
                    let posis = computePoints(this.#pointNodePosiArr);
                    if (posis) {
                        realFillNode = posis.wallPositions;
                        realLineNode = posis.mainLinePositions;
                        updatePolyline();
                        updatePolygon();
                    }
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
                    let posis = computePoints(this.#pointNodePosiArr);
                    if (posis) {
                        realFillNode = posis.wallPositions;
                        realLineNode = posis.mainLinePositions;
                        updatePolyline();
                        updatePolygon();
                    }
                }
                if (this.#pointNodePosiArr.length >= 2) {
                    // 更新最新鼠标点
                    this.#pointNodePosiArr.pop();
                    this.#pointNodePosiArr.push(position);
                    let posis = computePoints(this.#pointNodePosiArr);
                    if (posis) {
                        realFillNode = posis.wallPositions;
                        realLineNode = posis.mainLinePositions;
                        updatePolyline();
                        updatePolygon();
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 2) {
                let primitives = new Cesium.PrimitiveCollection();
                polylinePrimitive && primitives.add(polylinePrimitive);
                polygonPrimitive && primitives.add(polygonPrimitive);
                end(primitives);
            }
            this.#primitives.remove(polylinePrimitive);
            this.#primitives.remove(polygonPrimitive);
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
