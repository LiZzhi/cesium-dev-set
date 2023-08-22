/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// mapv图层
declare module "@/secdev/dataVisualization/lib/mapv/MapVLayer.js"
