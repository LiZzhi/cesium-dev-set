/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-10-28 09:20:11
 * @LastEditTime: 2024-04-30 09:40:41
 * @LastEditors: Xingtao 362042734@qq.com
 * @Description:
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\wind\wind3DGlsl\updatePosition.frag.ts
 */
const text = `
uniform sampler2D currentParticlesPosition; // (lon, lat, lev)
uniform sampler2D particlesSpeed; // (u, v, w, norm) Unit converted to degrees of longitude and latitude 

varying vec2 v_textureCoordinates;

void main() {
    // texture coordinate must be normalized
    vec3 lonLatLev = texture2D(currentParticlesPosition, v_textureCoordinates).rgb;
    vec3 speed = texture2D(particlesSpeed, v_textureCoordinates).rgb;
    vec3 nextParticle = lonLatLev + speed;

    gl_FragColor = vec4(nextParticle, 0.0);
}
`
export default text
