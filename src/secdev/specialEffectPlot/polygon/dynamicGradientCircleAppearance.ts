/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-22 10:13:59
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-24 11:04:32
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\dynamicGradientCircleAppearance.ts
 * @Description: 动态渐变圆材质
 */


import { Color, Viewer } from "cesium";

export type dynamicGradientOptionType = {
    color1: Color; // 流动颜色1
    color2: Color; // 流动颜色2
    color3: Color; // 噪声颜色
    isDynamic: boolean; // 是否动态
    innerRadius: number; // 内圈半径
    noiseScale: number; // 噪声规模
    speed: number;  // 速度
}


/**
 * @description: 动态渐变圆材质
 * @param {Partial<dynamicGradientOptionType>} option
 * @return {*}
 */
export default function(viewer: Viewer, option: Partial<dynamicGradientOptionType> = {}){
    let o = defaultOptions();
    o = Object.assign(o, option);
    let m = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            fabric: {
                uniforms: {
                    ...o,
                    time: 0,
                },
                source: `
                    uniform vec4 color1;
                    uniform vec4 color2;
                    uniform vec4 color3;
                    uniform bool isDynamic;
                    uniform float innerRadius;
                    uniform float noiseScale;
                    uniform float time;

                    vec3 hash33(vec3 p3)
                    {
                        p3 = fract(p3 * vec3(.1031,.11369,.13787));
                        p3 += dot(p3, p3.yxz+19.19);
                        return -1.0 + 2.0 * fract(vec3(p3.x+p3.y, p3.x+p3.z, p3.y+p3.z)*p3.zyx);
                    }

                    float snoise3(vec3 p)
                    {
                        const float K1 = 0.333333333;
                        const float K2 = 0.166666667;

                        vec3 i = floor(p + (p.x + p.y + p.z) * K1);
                        vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

                        vec3 e = step(vec3(0.0), d0 - d0.yzx);
                        vec3 i1 = e * (1.0 - e.zxy);
                        vec3 i2 = 1.0 - e.zxy * (1.0 - e);

                        vec3 d1 = d0 - (i1 - K2);
                        vec3 d2 = d0 - (i2 - K1);
                        vec3 d3 = d0 - 0.5;

                        vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
                        vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

                        return dot(vec4(31.316), n);
                    }

                    vec4 extractAlpha(vec3 colorIn)
                    {
                        vec4 colorOut;
                        float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
                        if (maxValue > 1e-5)
                        {
                            colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
                            colorOut.a = maxValue;
                        }
                        else
                        {
                            colorOut = vec4(0.0);
                        }
                        return colorOut;
                    }

                    float light1(float intensity, float attenuation, float dist)
                    {
                        return intensity / (1.0 + dist * attenuation);
                    }
                    float light2(float intensity, float attenuation, float dist)
                    {
                        return intensity / (1.0 + dist * dist * attenuation);
                    }

                    vec4 draw(vec2 vUv)
                    {
                        vec2 uv = vUv;
                        float ang = atan(uv.y, uv.x);
                        float len = length(uv);
                        float v0, v1, v2, v3, cl;
                        float r0, d0, n0;
                        float r, d;

                        // ring
                        n0 = snoise3( vec3(uv * noiseScale, time * 0.5) ) * 0.5 + 0.5;
                        r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), isDynamic ? n0 : 0.5);
                        d0 = distance(uv, r0 / len * uv);
                        v0 = light1(1.0, 10.0, d0);
                        v0 *= smoothstep(r0 * 1.05, r0, len);
                        cl = cos(ang + time * 2.0) * 0.5 + 0.5;

                        // high light
                        float a = time * -1.0;
                        vec2 pos = vec2(cos(a), sin(a)) * r0;
                        d = distance(uv, pos);
                        v1 = light2(1.5, 5.0, d);
                        v1 *= light1(1.0, 50.0 , d0);

                        // back decay
                        v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);

                        // hole
                        v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

                        // color
                        vec3 c = mix(color1.rgb, color2.rgb, cl);
                        vec3 col = mix(color1.rgb, color2.rgb, cl);
                        col = mix(color3.rgb, col, v0);
                        col = (col + v1) * v2 * v3;
                        col.rgb = clamp(col.rgb, 0.0, 1.0);

                        //gl_FragColor = extractAlpha(col);
                        vec4 _FragColor = extractAlpha(col);
                        return _FragColor;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 2.0  - 1.0 ;

                        vec4 col = draw(uv);
                        vec3 bg = vec3(0.);
                        vec3 color = mix(bg, col.rgb, col.a); //normal blend

                        material.alpha = col.a;
                        material.diffuse = color;
                        return material;
                    }
                `
            },
            translucent: true
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds = (performance.now() - startTime) / 1000 * o.speed;
        m.material.uniforms = {
            ...o,
            time: elapsedTimeSeconds,
        }
    }
    viewer.scene.preRender.addEventListener(update);
    function removeUpdate() {
        viewer.scene.preRender.removeEventListener(update);
    }
    return {
        material: m,
        removeUpdate: removeUpdate,
    };
}

function defaultOptions() {
    return {
        color1: new Cesium.Color(0.611765, 0.262745, 0.996078),
        color2: new Cesium.Color(0.298039, 0.760784, 0.913725),
        color3: new Cesium.Color(0.062745, 0.078431, 0.600000),
        innerRadius: 0.6,
        noiseScale: 0.65,
        isDynamic: true,
        speed: 1.0,
    }
}
