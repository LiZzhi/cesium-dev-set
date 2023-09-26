import * as echarts from "echarts"

/**
 * @class echarts可视化
 **/
export default class EchartsLayer {
  /**
   * @constructor
   * @param { Viewer } viewer 当前视图
   * @param { any } option echarts实例的配置项
   */
  constructor(viewer, option) {
    this._viewer = viewer;
    this.visible = true;
    //注册坐标系
    echarts.registerCoordinateSystem('cesium', this.getE3CoordinateSystem(viewer));
    this.createLayer();
    this.setChartOption(option);
  }

  //配置echarts图层
  setChartOption(option) {
    this.chartOption = option;
    this.setCharts();
  }

  setVisible(bool) {
    if (!this.box || this.visible === bool) return;
    this.box.hidden = !bool;
    this.visible = bool;
    bool === true && this.setCharts();
  }
  /*
      refreshBegin() {
          this.box.hidden = true;
      }

      refreshing() {
          this.setCharts();
      }

      refreshEnd() {
          this.box.hidden = false;
      }

      on(eventName, handler, context) {
          this.chart.on(eventName, handler, context);
      }

      off(eventName, handler, context) {
          this.chart.off(eventName, handler, context);
      }
  */
  //设置图表实例的配置项以及数据
  setCharts() {
    if (!this.visible) return;
    if (this.chartOption == null || this.chartOption == 'undefined') return;
    this.chart.setOption(this.chartOption);
    this.chartOption.animation = false;
  }

  /*创建layer的容器，添加到scene之上*/
  createLayer() {
    const scene = this._viewer.scene;
    scene.canvas.setAttribute('tabIndex', 0);
    var box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.top = '0px';
    box.style.left = '0px';
    box.style.width = scene.canvas.width + 'px';
    box.style.height = scene.canvas.height + 'px';
    box.style.pointerEvents = 'none';
    box.setAttribute('class', 'echartMap');
    box.id = "echartMap";
    this.box = box;
    let parent = this._viewer.container;
    parent.appendChild(box);
    this.chart = echarts.init(box); //创建一个 ECharts 实例
    this.startSceneEventListeners();
  }

  /*销毁实例*/
  remove() {
    echarts.init(document.getElementById('echartMap')).dispose();
    this.chart = null;
    this.box.outerHTML = "";
    this.box = null;
    this.chartOption = null;
    this._viewer.scene.postRender.removeEventListener(this.moveHandler, this);
    this._viewer = undefined;
  }

  /*监听场景事件，根据图层是否显示，判断是否重绘echarts*/
  startSceneEventListeners() {
    let viewer = this._viewer;
    viewer.scene.postRender.addEventListener(this.moveHandler, this);
  }

  moveHandler() {
    if (!this.visible) return;
    this.setCharts();
    //重新设置大小
    this.chart.resize({
      width: this._viewer.canvas.width,
      height: this._viewer.canvas.height
    });
    this.box.hidden = false;
  }

  getE3CoordinateSystem(viewer) {
    var CoordSystem = function CoordSystem(viewer) {
      this._viewer = viewer;
      this._mapOffset = [0, 0];
    };

    CoordSystem.create = function(ecModel) {
      ecModel.eachSeries(function(seriesModel) {
        if (seriesModel.get('coordinateSystem') === 'cesium') {
          seriesModel.coordinateSystem = new CoordSystem(viewer);
        }
      });
    };

    CoordSystem.getDimensionsInfo = function() {
      return ['x', 'y'];
    };

    CoordSystem.dimensions = ['x', 'y'];
    CoordSystem.prototype.dimensions = ['x', 'y'];
    CoordSystem.prototype.setMapOffset = function setMapOffset(mapOffset) {
      this._mapOffset = mapOffset;
    }
    CoordSystem.prototype.dataToPoint = function dataToPoint(data) {
      let scene = this._viewer.scene,
        origin = [0, 0],
        cartesian3 = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
      if (!cartesian3) return origin;
      if (scene.mode === Cesium.SceneMode.SCENE3D && Cesium.Cartesian3.angleBetween(scene.camera.position, cartesian3) > Cesium.Math.toRadians(80)) return !1;
      let canvasCoordinate = scene.cartesianToCanvasCoordinates(cartesian3);
      return canvasCoordinate ? [canvasCoordinate.x - this._mapOffset[0], canvasCoordinate.y - this._mapOffset[1]] : origin
    }
    CoordSystem.prototype.pointToData = function pointToData(pt) {
      let mapOffset = this._mapOffset,
        ellipsoid = viewer.scene.globe.ellipsoid,
        cartesian3 = new Cesium.cartesian3(pt[1] + mapOffset[1], pt[2] + mapOffset[2], 0),
        cartographic = ellipsoid.cartesianToCartographic(cartesian3);
      return cartographic ? [cartographic.lng, cartographic.lat] : [0, 0]
    };
    CoordSystem.prototype.getviewerRect = function getviewerRect() {
      let canvas = this._viewer.canvas;
      return new echarts.graphic.BoundingRect(0, 0, canvas.width, canvas.height)
    };
    CoordSystem.prototype.getRoamTransform = function getRoamTransform() {
      return matrix.create();
    };
    return CoordSystem
  }
}
