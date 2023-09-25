/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// mapv图层
declare module "@/thirdParty/mapv/MapVLayer.js"
declare module "@/thirdParty/mapv/mapv.js"

// 特效线
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineArrowMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineEnergyTransMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineLightingMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineLinkPulseMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineMigrateMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineSpriteMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineSuperMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineTrailMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineTrialFlowMaterial.js"
declare module "@/secdev/specialEffectPlot/lineMaterial/polylineVolumeTrialMaterial.js"

declare module "@/thirdParty/heatmap/heatmap.js"
