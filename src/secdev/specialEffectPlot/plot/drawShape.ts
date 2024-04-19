/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-08-28 10:20:04
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-19 11:23:01
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\plot\drawShape.ts
 * @Description: 矢量标绘
 */
import type {
    Viewer,
    ScreenSpaceEventHandler,
    Cartesian3,
    Entity,
    CustomDataSource,
    Cartographic,
} from "cesium";
import entityFactory from "../../utils/entityFactory";
import calculateRectangle from "../../utils/calculateRectangle";
import mouseMessageBox from "../../utils/mouseMessageBox";
import uuid from "@/utils/uuid";
import mathExtend from "@/secdev/utils/mathExtend";
import cartographicTool from "@/secdev/utils/cartographicTool";

export type pointCallBackType = (positions: Cartesian3) => void;
export type lineCallBackType = (positions: Cartesian3[]) => void;
export type curveCallBackType = (
    positions: Cartesian3[],
    node: Cartesian3[]
) => void;

export type circleCallBackType = (
    positions: Cartesian3[],
    distance: number
) => void;

export type polylineOptionsType = {
    maxNode?: number;
    clampToGround?: boolean;
};

export type circleOptionsType = {
    clampToGround?: boolean;
};

export default class drawShape {
    #viewer: Viewer;
    #drawShapeSource: CustomDataSource;
    #pointNodeArr: Entity[];
    #pointNodePosiArr: Cartesian3[];
    #isDepth: boolean;
    #handler: ScreenSpaceEventHandler | null;
    #drawEntity: Entity | null;
    #messageBox: mouseMessageBox;
    /**
     * @description: 绘图类
     * @param {Viewer} viewer
     * @return {*}
     */
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        // drawShape 类单独使用的 dataSourceCollection
        this.#drawShapeSource = new Cesium.CustomDataSource(
            "drawShape-" + uuid()
        );
        viewer.dataSources.add(this.#drawShapeSource);
        // 绘图过程中，临时记录的节点 Entity 的数组
        this.#pointNodeArr = [];
        // 绘图过程中，临时记录的节点 Cartesian3 的数组
        this.#pointNodePosiArr = [];
        // 绘图过程中，临时的 Entity
        this.#drawEntity = null;
        // 记录当前深度检测状态
        this.#isDepth = viewer.scene.globe.depthTestAgainstTerrain;
        // 屏幕事件句柄
        this.#handler = null;
        // 提示dom
        this.#messageBox = new mouseMessageBox(viewer);
    }

    /**
     * 绘制点要素
     * @param {pointCallBackType} end 绘制结束回调函数
     */
    drawPoint(end: pointCallBackType): void {
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击绘制点");
        this.#handler.setInputAction((e: any) => {
            // 左键点击画点
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                this.#drawEnd();

                // 结束回调
                end(position);
            }
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 右键点击提前结束
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    drawMultiPoint(end: lineCallBackType) {
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击绘制点位，右击结束绘制");
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                // 添加节点
                this.#addTemporaryPoint(position);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length) {
                let position = this.#pointNodePosiArr.map((v) => v.clone());
                end(position);
            }
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制线要素
     * @param { lineCallBackType } end 绘制结束回调函数
     * @param { polylineOptionsType } options (可选)配置项
     */
    drawPolyline(
        end: lineCallBackType,
        options: polylineOptionsType = {}
    ): void {
        // 配置项
        const { maxNode, clampToGround } = Object.assign(
            {
                maxNode: Number.POSITIVE_INFINITY, // (可选)最大节点数量,默认为正无穷
                clampToGround: true, // (可选)是否贴地,默认贴地
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length >= maxNode) {
                    // 超出节点限制结束绘图
                    if (this.#pointNodePosiArr.length >= 2) {
                        let position = this.#pointNodePosiArr.map((v) =>
                            v.clone()
                        );
                        end(position);
                    }
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);

                // 添加临时绘图线
                if (!this.#drawEntity) {
                    const p = new Cesium.CallbackProperty(() => {
                        return this.#pointNodePosiArr;
                    }, false);
                    if (clampToGround) {
                        this.#drawEntity = entityFactory.createPolyline(p);
                    } else {
                        this.#drawEntity =
                            entityFactory.createStraightPolyline(p);
                    }
                    this.#drawShapeSource.entities.add(this.#drawEntity);
                    this.#messageBox.changeMessage(
                        "单击继续绘制，右击结束绘制"
                    );
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
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 2) {
                let position = this.#pointNodePosiArr.map((v) => v.clone());
                end(position);
            }
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制弧线要素
     * @param { curveCallBackType } end 绘制结束回调函数
     * @param { circleOptionsType } options (可选)配置项
     */
    drawArc(end: curveCallBackType, options: circleOptionsType = {}): void {
        // 配置项
        const { clampToGround } = Object.assign(
            {
                clampToGround: true, // (可选)是否贴地,默认贴地
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        function computeArc(ps: Cartesian3[]) {
            let degrees = cartographicTool.formCartesian3S(ps, {
                z: false,
            });
            if (
                degrees[1][0] === degrees[2][0] &&
                degrees[1][1] === degrees[2][1]
            ) {
                // 出现后两位相同情况时跳过
                return cartographicTool.toCartesian3S(degrees);
            } else {
                let newDegrees = mathExtend.getArcPositions(
                    degrees[0],
                    degrees[1],
                    degrees[2]
                );
                return cartographicTool.toCartesian3S(newDegrees);
            }
        }
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length >= 3) {
                    // 超出节点限制结束绘图
                    if (this.#pointNodePosiArr.length >= 2) {
                        let node = this.#pointNodePosiArr.map((v) => v.clone());
                        let ps = computeArc(this.#pointNodePosiArr);
                        end(ps, node);
                    }
                    // 结束绘图
                    this.#drawEnd();
                    return;
                } else {
                    // 添加节点
                    this.#addTemporaryPoint(position);

                    // 添加临时绘图线
                    if (!this.#drawEntity) {
                        const p = new Cesium.CallbackProperty(() => {
                            if (this.#pointNodePosiArr.length <= 2) {
                                return this.#pointNodePosiArr;
                            } else {
                                // 计算曲线
                                return computeArc(this.#pointNodePosiArr);
                            }
                        }, false);
                        if (clampToGround) {
                            this.#drawEntity = entityFactory.createPolyline(p);
                        } else {
                            this.#drawEntity =
                                entityFactory.createStraightPolyline(p);
                        }
                        this.#drawShapeSource.entities.add(this.#drawEntity);
                        this.#messageBox.changeMessage(
                            "单击继续绘制，右击取消绘制"
                        );
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
                }
                if (this.#pointNodePosiArr.length >= 2) {
                    // 更新最新鼠标点
                    this.#pointNodePosiArr.pop();
                    this.#pointNodePosiArr.push(position);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制曲线要素
     * @param { curveCallBackType } end 绘制结束回调函数
     * @param { polylineOptionsType } options (可选)配置项
     */
    drawCurve(end: curveCallBackType, options: polylineOptionsType = {}): void {
        // 配置项
        const { maxNode, clampToGround } = Object.assign(
            {
                maxNode: Number.POSITIVE_INFINITY, // (可选)最大节点数量,默认为正无穷
                clampToGround: true, // (可选)是否贴地,默认贴地
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        // 计算曲线点位
        function computeCurve(ps: Cartesian3[]) {
            let degrees = cartographicTool.formCartesian3S(ps, {
                z: false,
            });
            const leftControl = mathExtend.getLeftMostControlPoint(
                degrees,
                0.3
            );
            let normals: number[][] = [leftControl];
            for (let i = 0; i < degrees.length - 2; i++) {
                const pnt1 = degrees[i];
                const pnt2 = degrees[i + 1];
                const pnt3 = degrees[i + 2];
                const normalPoints = mathExtend.getBisectorNormals(
                    pnt1,
                    pnt2,
                    pnt3,
                    0.3
                );
                normals.push(...normalPoints);
            }
            const rightControl = mathExtend.getRightMostControlPoint(
                degrees,
                0.3
            );
            normals.push(rightControl);
            const points: number[][] = [];
            for (let i = 0; i < degrees.length - 1; i++) {
                const pnt1 = degrees[i];
                const pnt2 = degrees[i + 1];
                points.push(pnt1);
                for (let t = 0; t < 100; t++) {
                    const pnt = mathExtend.getCubicValue(
                        normals[i * 2],
                        normals[i * 2 + 1],
                        pnt1,
                        pnt2,
                        t / 100
                    );
                    points.push(pnt);
                }
                points.push(pnt2);
            }
            return cartographicTool.toCartesian3S(points);
        }
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length >= maxNode) {
                    // 超出节点限制结束绘图
                    if (this.#pointNodePosiArr.length >= 2) {
                        let node = this.#pointNodePosiArr.map((v) => v.clone());
                        // 计算贝塞尔曲线
                        let positions = computeCurve(this.#pointNodePosiArr);
                        end(positions, node);
                    }
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);

                // 添加临时绘图线
                if (!this.#drawEntity) {
                    const p = new Cesium.CallbackProperty(() => {
                        if (this.#pointNodePosiArr.length <= 2) {
                            return this.#pointNodePosiArr;
                        } else {
                            // 计算曲线
                            return computeCurve(this.#pointNodePosiArr);
                        }
                    }, false);
                    if (clampToGround) {
                        this.#drawEntity = entityFactory.createPolyline(p);
                    } else {
                        this.#drawEntity =
                            entityFactory.createStraightPolyline(p);
                    }
                    this.#drawShapeSource.entities.add(this.#drawEntity);
                    this.#messageBox.changeMessage(
                        "单击继续绘制，右击结束绘制"
                    );
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
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 2) {
                let node = this.#pointNodePosiArr.map((v) => v.clone());
                // 计算曲线
                let positions = computeCurve(this.#pointNodePosiArr);
                end(positions, node);
            }
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制自由线要素
     * @param { lineCallBackType } end 绘制结束回调函数
     * @param { circleOptionsType } options (可选)配置项
     */
    drawFreePolyline(
        end: lineCallBackType,
        options: circleOptionsType = {}
    ): void {
        // 配置项
        const { clampToGround } = Object.assign(
            {
                clampToGround: true, // (可选)是否贴地,默认贴地
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        this.#handler.setInputAction((e: any) => {
            // 左键点击画折线
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                // 超出节点限制结束绘图
                if (this.#pointNodePosiArr.length >= 2) {
                    let position = this.#pointNodePosiArr.map((v) => v.clone());
                    end(position);
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);

                // 添加临时绘图线
                if (!this.#drawEntity) {
                    const p = new Cesium.CallbackProperty(() => {
                        return this.#pointNodePosiArr;
                    }, false);
                    if (clampToGround) {
                        this.#drawEntity = entityFactory.createPolyline(p);
                    } else {
                        this.#drawEntity =
                            entityFactory.createStraightPolyline(p);
                    }
                    this.#drawShapeSource.entities.add(this.#drawEntity);
                    this.#messageBox.changeMessage(
                        "单击结束绘制，右击取消绘制"
                    );
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 鼠标移动事件
            let position = this.#viewer.scene.pickPosition(e.endPosition);
            // 移动点跟着光标动
            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length >= 1) {
                    this.#pointNodePosiArr.push(position);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制面要素
     * @param { lineCallBackType } end 绘制结束回调函数
     * @param { number } maxNode (可选)最大节点数量,默认为正无穷
     */
    drawPolygon(
        end: lineCallBackType,
        maxNode: number = Number.POSITIVE_INFINITY
    ): void {
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        this.#handler.setInputAction((e: any) => {
            // 左键点击画面
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                if (this.#pointNodePosiArr.length >= maxNode) {
                    // 超出节点限制结束绘图
                    if (this.#pointNodePosiArr.length >= 3) {
                        let position = this.#pointNodePosiArr.map((v) =>
                            v.clone()
                        );
                        end(position);
                    }
                    // 结束绘图
                    this.#drawEnd();
                    return;
                }

                // 添加节点
                this.#addTemporaryPoint(position);

                // 添加临时绘图面
                if (!this.#drawEntity) {
                    this.#drawEntity = this.#drawShapeSource.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                return this.#pointNodePosiArr;
                            }, false),
                            width: 3,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.fromCssColorString(
                                    "rgb(22,236,255)"
                                ),
                            }),
                            clampToGround: true,
                            arcType: Cesium.ArcType.RHUMB,
                        },
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(() => {
                                return new Cesium.PolygonHierarchy(
                                    // 不深拷贝源数据就会被修改,真是奇怪了这操作
                                    this.#pointNodePosiArr.map((v) => v.clone())
                                );
                            }, false),
                            material: new Cesium.ColorMaterialProperty(
                                Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                            ),
                            arcType: Cesium.ArcType.RHUMB,
                        },
                    });
                    this.#messageBox.changeMessage(
                        "单击继续绘制，右击结束绘制"
                    );
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
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#pointNodePosiArr.length >= 3) {
                let position = this.#pointNodePosiArr.map((v) => v.clone());
                end(position);
            }
            // 右键点击结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制圆要素
     * @param { circleCallBackType } end 绘制结束回调函数
     */
    drawCircle(end: circleCallBackType, options: circleOptionsType = {}): void {
        const { clampToGround } = Object.assign(
            {
                clampToGround: true,
            },
            options
        );
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        // 圆心
        let circleCenter: Cartesian3;
        let endPosition: Cartesian3;
        let cartographic0: Cartographic;
        let cartographic1: Cartographic;
        let distance = 0;
        this.#handler.setInputAction((e: any) => {
            // 左键点击画面
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                // 添加节点
                if (!circleCenter) {
                    this.#addTemporaryPoint(position);
                    circleCenter = position;
                    cartographic0 =
                        this.#viewer.scene.globe.ellipsoid.cartesianToCartographic(
                            circleCenter
                        );
                    cartographic1 = cartographic0;
                    this.#messageBox.changeMessage("单击结束绘制");
                } else {
                    // 第二个节点
                    if (distance) {
                        endPosition = position;
                        // 结束回调
                        if (this.#drawEntity && Cesium.defined(endPosition)) {
                            end([circleCenter, endPosition], distance);
                        }
                        // 右键点击结束绘图
                        this.#drawEnd();
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 鼠标移动事件
            endPosition = this.#viewer.scene.pickPosition(e.endPosition);
            // 移动点跟着光标动
            if (Cesium.defined(endPosition) && circleCenter) {
                cartographic1 =
                    this.#viewer.scene.globe.ellipsoid.cartesianToCartographic(
                        endPosition
                    );
                let geodesic = new Cesium.EllipsoidGeodesic(
                    cartographic0,
                    cartographic1,
                    this.#viewer.scene.globe.ellipsoid
                );

                distance = geodesic.surfaceDistance;

                if (circleCenter && !this.#drawEntity) {
                    if (clampToGround) {
                        this.#drawEntity = entityFactory.createCircle(
                            circleCenter,
                            new Cesium.CallbackProperty(() => distance, false)
                        );
                    } else {
                        this.#drawEntity = entityFactory.createHeightCircle(
                            circleCenter,
                            new Cesium.CallbackProperty(() => distance, false),
                            new Cesium.CallbackProperty(
                                () => cartographic1.height,
                                false
                            ),
                            {
                                // 添加高度线
                                polyline: {
                                    positions: new Cesium.CallbackProperty(
                                        () => {
                                            return [
                                                circleCenter,
                                                Cesium.Cartesian3.fromRadians(
                                                    cartographic0.longitude,
                                                    cartographic0.latitude,
                                                    cartographic1.height
                                                ),
                                            ];
                                        },
                                        false
                                    ),
                                    width: 3,
                                    material:
                                        new Cesium.PolylineDashMaterialProperty(
                                            {
                                                color: Cesium.Color.fromCssColorString(
                                                    "rgb(22,236,255)"
                                                ),
                                            }
                                        ),
                                    arcType: Cesium.ArcType.NONE,
                                },
                            }
                        );
                    }
                    this.#drawShapeSource.entities.add(this.#drawEntity);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            if (this.#drawEntity && Cesium.defined(endPosition)) {
                end([circleCenter, endPosition], distance);
            }
            // 右键点击结束绘图
            this.#drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 绘制矩形要素
     * @param { lineCallBackType } end 绘制结束回调函数
     */
    drawRectangle(end: lineCallBackType) {
        // 绘图前准备并获取屏幕事件句柄
        this.#handler = this.#drawStart();
        this.#messageBox.create("单击开始绘制");
        // 初始两点
        let pointA: Cartesian3, pointB: Cartesian3;
        this.#handler.setInputAction((e: any) => {
            // 左键点击画面
            let position = this.#viewer.scene.pickPosition(e.position);

            if (Cesium.defined(position)) {
                // 添加节点
                if (this.#pointNodeArr.length < 2) {
                    this.#addTemporaryPoint(position);
                    if (!pointA) {
                        pointA = position;
                        this.#messageBox.changeMessage("单击继续绘制");
                    } else if (!pointB) {
                        pointB = position;
                        this.#messageBox.changeMessage("单击结束绘制");
                    }
                } else {
                    if (pointA && pointB) {
                        // 结束绘图
                        let p = calculateRectangle([pointA, pointB, position]);
                        end(p);
                        // 结束绘图
                        this.#drawEnd();
                        return;
                    }
                }
                // 添加临时绘图面
                if (!this.#drawEntity) {
                    this.#drawEntity = this.#drawShapeSource.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                return this.#pointNodePosiArr.length !== 4
                                    ? this.#pointNodePosiArr
                                    : this.#pointNodePosiArr.concat(
                                          this.#pointNodePosiArr[0]
                                      );
                            }, false),
                            width: 3,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.fromCssColorString(
                                    "rgb(22,236,255)"
                                ),
                            }),
                            clampToGround: true,
                            arcType: Cesium.ArcType.RHUMB,
                        },
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(() => {
                                return new Cesium.PolygonHierarchy(
                                    // 不深拷贝源数据就会被修改,真是奇怪了这操作
                                    this.#pointNodePosiArr.map((v) => v.clone())
                                );
                            }, false),
                            material: new Cesium.ColorMaterialProperty(
                                Cesium.Color.LIGHTSKYBLUE.withAlpha(0.5)
                            ),
                            arcType: Cesium.ArcType.RHUMB,
                        },
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.#handler.setInputAction((e: any) => {
            // 鼠标移动事件
            let position = this.#viewer.scene.pickPosition(e.endPosition);
            // 移动点跟着光标动
            if (Cesium.defined(position)) {
                if (pointA && pointB) {
                    this.#pointNodePosiArr = calculateRectangle([
                        pointA,
                        pointB,
                        position,
                    ]);
                    return;
                }
                if (this.#pointNodePosiArr.length === 1) {
                    this.#pointNodePosiArr.push(position);
                }
                if (this.#pointNodePosiArr.length >= 2) {
                    // 更新最新鼠标点
                    this.#pointNodePosiArr.pop();
                    this.#pointNodePosiArr.push(position);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.#handler.setInputAction((e: any) => {
            // 结束回调
            let position = this.#viewer.scene.pickPosition(e.position);
            if (Cesium.defined(position)) {
                if (pointA && pointB) {
                    let p = calculateRectangle([pointA, pointB, position]);
                    end(p);
                }
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
        this.#viewer.dataSources.remove(this.#drawShapeSource);
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
            this.#handler = null;
        }
        // 销毁当前临时绘图 Entity
        if (this.#drawEntity) {
            this.#drawShapeSource.entities.remove(this.#drawEntity);
            this.#drawEntity = null;
        }
        // 销毁当前临时绘图的节点 Entity
        if (this.#pointNodeArr.length > 0) {
            this.#pointNodeArr.forEach((v) => {
                this.#drawShapeSource.entities.remove(v);
            });
            this.#pointNodeArr.length = 0;
        }
        // 清空当前临时绘图的节点坐标数组
        if (this.#pointNodePosiArr.length > 0) {
            this.#pointNodePosiArr.length = 0;
        }
    }

    /**
     * 添加临时绘图节点
     * @param { Cartesian3 } position 节点坐标
     */
    #addTemporaryPoint(position: Cartesian3): void {
        const temporaryPoint = entityFactory.createPoint(position);
        this.#drawShapeSource.entities.add(temporaryPoint);
        this.#pointNodePosiArr.push(position);
        this.#pointNodeArr.push(temporaryPoint);
    }
}
