/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-22 10:53:38
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-04-22 11:05:40
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\dynamicMaskAppearance.ts
 * @Description: 动态遮罩材质
 */
import { Viewer } from "cesium";

export type dynamicMaskOptionType = {
    speed: number; // 速度
};

export default function (viewer: Viewer, option: Partial<dynamicMaskOptionType> = {}) {
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
                    precision highp float;

                    uniform float time;

                    float gTime = 0.;

                    // 回转行列
                    mat2 rot(float a) {
                        float c = cos(a), s = sin(a);
                        return mat2(c,s,-s,c);
                    }

                    float sdBox( vec3 p, vec3 b )
                    {
                        vec3 q = abs(p) - b;
                        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
                    }

                    float box(vec3 pos, float scale) {
                        pos *= scale;
                        float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
                        pos.xy *= 5.;
                        pos.y -= 3.5;
                        pos.xy *= rot(.75);
                        float result = -base;
                        return result;
                    }

                    float box_set(vec3 pos, float time) {
                        vec3 pos_origin = pos;
                        pos = pos_origin;
                        pos .y += sin(gTime * 0.4) * 2.5;
                        pos.xy *=   rot(.8);
                        float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
                        pos = pos_origin;
                        pos .y -=sin(gTime * 0.4) * 2.5;
                        pos.xy *=   rot(.8);
                        float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
                        pos = pos_origin;
                        pos .x +=sin(gTime * 0.4) * 2.5;
                        pos.xy *=   rot(.8);
                        float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
                        pos = pos_origin;
                        pos .x -=sin(gTime * 0.4) * 2.5;
                        pos.xy *=   rot(.8);
                        float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
                        pos = pos_origin;
                        pos.xy *=   rot(.8);
                        float box5 = box(pos,.5) * 6.;
                        pos = pos_origin;
                        float box6 = box(pos,.5) * 6.;
                        float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
                        return result;
                    }

                    float map(vec3 pos, float time) {
                        vec3 pos_origin = pos;
                        float box_set1 = box_set(pos, time);

                        return box_set1;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 2. - 1.;
                        vec3 ro = vec3(0., -0.2 ,time * 4.);
                        vec3 ray = normalize(vec3(uv, 1.5));
                        ray.xy = ray.xy * rot(sin(time * .03) * 5.);
                        ray.yz = ray.yz * rot(sin(time * .05) * .2);
                        float t = 0.1;
                        vec3 col = vec3(0.);
                        float ac = 0.0;

                        for (int i = 0; i < 99; i++){
                            vec3 pos = ro + ray * t;
                            pos = mod(pos-2., 4.) -2.;
                            gTime = time -float(i) * 0.01;

                            float d = map(pos, time);

                            d = max(abs(d), 0.01);
                            ac += exp(-d*23.);

                            t += d* 0.55;
                        }

                        col = vec3(ac * 0.02);
                        col += vec3(0.,0.2 * abs(sin(time)),0.5 + sin(time) * 0.2);

                        material.diffuse = col;
                        material.alpha = 1.0 - t * (0.02 + 0.02 * sin (time));

                        return material;
                    }
                `,
            },
            translucent: true,
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false,
    });

    const startTime = performance.now();
    function update() {
        const elapsedTimeSeconds =
            ((performance.now() - startTime) / 1000) * o.speed;
        m.material.uniforms = {
            ...o,
            time: elapsedTimeSeconds,
        };
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
        speed: 1.0, // 速度
    };
}
