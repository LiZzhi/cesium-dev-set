/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-07-16 16:30:01
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-07-17 14:29:56
 * @FilePath: \cesium-secdev-set\src\secdev\specialEffectPlot\polygon\dynamicScanAppearance.ts
 * @Description: 动态扫描圈材质
 */
import { Viewer } from "cesium";

export type dynamicScanOptionType = {
    speed: number, // 速度
};

export default function (viewer: Viewer, option: Partial<dynamicScanOptionType> = {}) {
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
                    uniform float time;

                    const float M_PI = 3.1415926535897932384626433832795;

                    const vec3 blue1 = vec3(0.74,0.95,1.00);
                    const vec3 blue2 = vec3(0.87,0.98,1.00);
                    const vec3 blue3 = vec3(0.35,0.76,0.83);

                    float SMOOTH(float r, float R)
                    {
                        return 1.0-smoothstep(R-1.0,R+1.0, r);
                    }

                    float RS(float a, float b, float x)
                    {
                        return smoothstep(a-1.0,a+1.0,x)*(1.0-smoothstep(b-1.0,b+1.0,x));
                    }

                    float movingLine(vec2 uv, vec2 center, float radius)
                    {
                        //angle of the line
                        float theta0 = 90.0 * time;
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        if(r<radius)
                        {
                            //compute the distance to the line theta=theta0
                            vec2 p = radius*vec2(cos(theta0*M_PI/180.0),
                                                -sin(theta0*M_PI/180.0));
                            float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
                            d = normalize(d);
                            //compute gradient based on angle difference to theta0
                            float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
                            float gradient = clamp(1.0-theta/90.0,0.0,1.0);
                            return SMOOTH(l,1.0)+0.5*gradient;
                        }
                        else return 0.0;
                    }

                    float circle(vec2 uv, vec2 center, float radius, float width)
                    {
                        float r = length(uv - center);
                        return SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius);
                    }

                    float circle2(vec2 uv, vec2 center, float radius, float width, float opening)
                    {
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        d = normalize(d);
                        if( abs(d.y) > opening )
                            return SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius);
                        else
                            return 0.0;
                    }

                    float circle3(vec2 uv, vec2 center, float radius, float width)
                    {
                        vec2 d = uv - center;
                        float r = sqrt( dot( d, d ) );
                        d = normalize(d);
                        float theta = 180.0*(atan(d.y,d.x)/M_PI);
                        return smoothstep(2.0, 2.1, abs(mod(theta+2.0,45.0)-2.0)) *
                            mix( 0.5, 1.0, step(45.0, abs(mod(theta, 36.0)-90.0)) ) *
                            (SMOOTH(r-width/2.0,radius)-SMOOTH(r+width/2.0,radius));
                    }

                    float triangles(vec2 uv, vec2 center, float radius)
                    {
                        vec2 d = uv - center;
                        return RS(-8.0, 0.0, d.x-radius) * (1.0-smoothstep( 7.0+d.x-radius,9.0+d.x-radius, abs(d.y)))
                            + RS( 0.0, 8.0, d.x+radius) * (1.0-smoothstep( 7.0-d.x-radius,9.0-d.x-radius, abs(d.y)))
                            + RS(-8.0, 0.0, d.y-radius) * (1.0-smoothstep( 7.0+d.y-radius,9.0+d.y-radius, abs(d.x)))
                            + RS( 0.0, 8.0, d.y+radius) * (1.0-smoothstep( 7.0-d.y-radius,9.0-d.y-radius, abs(d.x)));
                    }

                    float _cross(vec2 uv, vec2 center, float radius)
                    {
                        vec2 d = uv - center;
                        int x = int(d.x);
                        int y = int(d.y);
                        float r = sqrt( dot( d, d ) );
                        if( (r<radius) && ( (x==y) || (x==-y) ) )
                            return 1.0;
                        else return 0.0;
                    }

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st * 640.;

                        vec3 finalColor; // 颜色
                        float alpha; // 透明度

                        vec2 c = vec2(640.) / 2.; // 中心

                        float cross_result = _cross(uv, c, 240.0);
                        finalColor = vec3(0.3 * cross_result);
                        alpha = cross_result;

                        // 两个内圈
                        float circle_result_1 = circle(uv, c, 100.0, 2.0) + circle(uv, c, 165.0, 1.0);
                        finalColor += circle_result_1 * blue1;
                        alpha += circle_result_1;
                        // 白圈
                        float circle_result_2 = circle(uv, c, 240.0, 4.0);
                        finalColor += circle_result_2;
                        alpha += circle_result_2;
                        // 最外圈
                        float circle3_result = circle3(uv, c, 320.0, 10.0);
                        finalColor += circle3_result * blue1;
                        alpha += circle3_result;
                        // 三角
                        float triangles_result = triangles(uv, c, 315.0 + 30.0 * sin(time));
                        finalColor += triangles_result * blue2;
                        alpha += triangles_result;
                        // 扫描线
                        float movingLine_result = movingLine(uv, c, 240.0);
                        finalColor += movingLine_result * blue3;
                        alpha += movingLine_result;
                        // 最内圈
                        float circle_result_3 = circle(uv, c, 10.0, 2.0);
                        finalColor += circle_result_3 * blue3;
                        alpha += circle_result_3;
                        // 中间动态圈
                        float circle2_result = circle2(uv, c, 262.0, 2.0, 0.5+0.2*cos(time));
                        finalColor += 0.7 * circle2_result * blue3;
                        alpha += circle2_result;

                        material.diffuse = finalColor;
                        material.alpha = alpha;

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
