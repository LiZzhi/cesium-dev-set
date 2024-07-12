
/**
 * 创建高斯模糊后期处理节点（返回结果已包含x、y两个方向）
 * @param {string} name 
 * @param {number} maxRadius 
 * @param {number} kernelRadius 
 * @param {number} textureScale 
 * @returns {Cesium.PostProcessStageComposite}
 */
export default function createBlurStage(name: string, maxRadius: number, kernelRadius: number, textureScale: number): Cesium.PostProcessStageComposite