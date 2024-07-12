
import Cesium from "../Cesium";
class EdgePostProcessStage extends Cesium.PostProcessStage {
  uniforms: {
    /**
     * @default false
     */
    edgeOnly:boolean
    /**
     * @default 1
     */
    edgeGlow: number
    /**
     * @default 3
     */
    edgeStrength: number
    /**
     * true则只显示轮廓线，此时thresholdAngle无效
     * @default false
     */
    showOutlineOnly: boolean
    /**
     * 如果两个三角面的法线间夹角小于该值则标记为同一个平面。该值的单位为弧度
     * @default 0.5 * Math.PI/180
     */
    thresholdAngle: number
    /**
     * 轮廓线宽度，单位为像素/px
     * @default 2
     */
    outlineWidth: number
    /**
     * 未被遮挡的轮廓线颜色
     *@default Cesium.Color.WHITE
     */
    visibleEdgeColor: Cesium.Color
    /**
     * 被遮挡的轮廓线颜色
     *@default Cesium.Color.DARKRED
     */
    hiddenEdgeColor: Cesium.Color
    /**
     * true则遮挡和未被遮挡的轮廓线都使用同一个颜色，这样可以提升一小部分性能
     * @default false
     */
    useSingleColor: boolean
  }
  /**
   * @default false
   */
  edgeOnly:boolean
  
  /**
   * @default true
   */
  showGlow:boolean
  /**
       * @default 1
       */
  edgeGlow: number
  /**
    * @default 3
    */
  edgeStrength: number
  /**
   * true则只显示轮廓线，此时thresholdAngle无效
   * @default false
   */
  showOutlineOnly: boolean
  /**
   * 如果两个三角面的法线间夹角小于该值则标记为同一个平面。该值的单位为弧度
   * @default 0.5 * Math.PI/180
   */
  thresholdAngle: number
  /**
    * 轮廓线宽度，单位为像素/px
    * @default 2
    */
  outlineWidth: number
  /**
   * 未被遮挡的轮廓线颜色
   *@default Cesium.Color.WHITE
   */
  visibleEdgeColor: Cesium.Color
  /**
   * 被遮挡的轮廓线颜色
   *@default Cesium.Color.DARKRED
   */
  hiddenEdgeColor: Cesium.Color
  /**
   * true则遮挡和未被遮挡的轮廓线都使用同一个颜色，这样可以提升一小部分性能
   * @default false
   */
  useSingleColor: boolean
}
/**
 * 在Cesium后期处理中实现three.js EdgeGeometry的效果：对选中对象进行描边，并且根据thresholdAngle剔除平面内的三角形的边
 * @param {string} [name] 
 * @returns {OutlinePostProcessStage} stage
 */
export default function createEdgeStage(name?: string): EdgePostProcessStage