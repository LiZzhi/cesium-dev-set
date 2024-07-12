import Cesium from "../Cesium";

/**
 * 后期渲染通道，实现功能：
 *      在Cesium主渲染流程完成后，指定后期处理节点（stage）开始前，
 * 将选中的对象或者没有被选中的对象（在fragmentShader中调用内置的czm_selected()方法识别）渲染到缓冲区，
 * 然后在该后期处理节点通过texture属性获取当前通道的颜色数据，通过depthTexture获取深度数据。
 * @example
 * 
 *   
 * //1.创建后期渲染通道
    const maskPass = new CesiumRenderPass({
        name:  'colorMask',
        fragmentShader: `
        void main(){
            if(!czm_selected())discard;
        }
        `
    })
    //2.创建后期处理节点
    const stage = new Cesium.PostProcessStage({
        name: name,
        uniforms: {
            //传递颜色
            maskTexture() {
                return maskPass.texture
            },
            //传递深度
            maskDepthTexture() {
                return maskPass.depthTexture
            }
        },
        fragmentShader: `
uniform sampler2D maskDepthTexture;
uniform sampler2D maskTexture;
//cesium内置的uv变量
varying vec2 v_textureCoordinates;

void main(void)
{  
    //读取颜色缓冲区数据
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    //按rgba读取深度缓冲区数据
    vec4 depthColor = texture2D(maskDepthTexture, v_textureCoordinates);
    //读取深度值
    float depth=czm_readDepth(maskDepthTexture, v_textureCoordinates);
    gl_FragColor =color;
}
 `
    })

    //3.绑定后期处理节点
    depthPass.stage = stage

    //4.在cesium场景中使用
    stage.selected = [xxx];//设置选中对象，实际项目中可以通过监听鼠标点击事件pick到对象再赋值
    viewer.postProcessStages.add(stage)
 */
export default class CesiumRenderPass {
    constructor(options: {
        name: string
        vertexShader?: string
        fragmentShader?: string
        shaderRedefine?: 'replace' | 'add'
        /**
         * 渲染目标纹理缩放
         * @default 1.0
         */
        textureScale?: number
        pixelFormat?: Cesium.PixelFormat
        pixelDatatype?: Cesium.PixelDatatype
        sampler?: Cesium.Sampler
        viewportScale?: {
            x: number
            y: number
            with: number
            height: number
        }
        overrideViewport?:Cesium.BoundingRectangle
        /**
         * 设置需要渲染的对象：
         * * all——当前渲染队列中的所有绘图命令
         * * selected——渲染队列中被选中的对象关联的绘图命令，只过滤用整个对象内所有几何体的所有顶点pickId都相同的情况，
         * 如果将pickId写入几何体的顶点则需要手动在shader中过滤（通过调用czm_selected()来判断是否为选中对象）
         * * unselected——渲染队列中的所有未被选中的对象关联的绘图命令
         * @default 'all'
         */
        renderType?: 'all' | 'selected' | 'unselected'
        uniforms?: { [key: string]: boolean | number | Cesium.Matrix4 | Cesium.Cartesian2 | Cesium.Color | Cesium.Cartesian3 | Cesium.Texture | (() => (boolean | number | Cesium.Matrix4 | Cesium.Cartesian2 | Cesium.Color | Cesium.Cartesian3 | Cesium.Texture)) }
        beforeUpdate?(scene: Cesium.Scene): void
        renderStateProcess?(renderState?: Cesium.RenderState): void
    })
    /**
     * 获取颜色纹理。请在uniform回调函数中获取，因为纹理在后期处理节点的update被调用时才会生成，提前获取不到。
     *@example
     //pass=new CesiumRenderPass...
     //...
     let uniforms={
         colorTexture(){
          return pass.texture
         }
      }
      //...
     */
    readonly texture: Cesium.Texture
    /**
     * 获取深度纹理。请在uniform回调函数中获取。 
     *@example
     //pass=new CesiumRenderPass...
     //...
     let uniforms={
         depthTexture(){
          return pass.depthTexture
         }
      }
      //...
     */
    readonly depthTexture: Cesium.Texture
    /**
     * 设置绑定的后期处理节点。必须绑定后期处理节点，否则渲染通道将不会被调用执行渲染工作，也无法获取depthTexture和exture。
     */
    stage: Cesium.PostProcessStage
    clear(context: Cesium.Context): void
    update(context: Cesium.Context): void
}
export const packing: string;