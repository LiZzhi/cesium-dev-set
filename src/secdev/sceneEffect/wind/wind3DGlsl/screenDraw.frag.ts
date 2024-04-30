/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-10-28 09:20:11
 * @LastEditTime: 2024-04-30 09:39:40
 * @LastEditors: Xingtao 362042734@qq.com
 * @Description:
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\wind\wind3DGlsl\screenDraw.frag.ts
 */
const text = `
uniform sampler2D trailsColorTexture;
uniform sampler2D trailsDepthTexture;

varying vec2 textureCoordinate;

void main() {
    vec4 trailsColor = texture2D(trailsColorTexture, textureCoordinate);
    float trailsDepth = texture2D(trailsDepthTexture, textureCoordinate).r;
    float globeDepth = czm_unpackDepth(texture2D(czm_globeDepthTexture, textureCoordinate));

    if (trailsDepth < globeDepth) {
        gl_FragColor = trailsColor;
    } else {
        gl_FragColor = vec4(0.0);
    }
}
`
export default text
