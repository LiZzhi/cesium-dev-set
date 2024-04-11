import { Color, Viewer } from "cesium";

export type flowOptionType = {
    color: Color; // 颜色
    speed: number; // 速度
};

export default function (viewer: Viewer, option: Partial<flowOptionType> = {}) {
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
                    uniform vec4 color;
                    uniform float time;

                    czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 uv = materialInput.st;
                        // uv *= uv;
                        float d = uv.y;
                        d = sin(d*8. + time)/10.0;
                        d = abs(d);

                        material.diffuse = color.rgb;
                        material.alpha = (1.0 - d/0.1)*0.5;

                        if(
                            uv.y < 0.501 ||
                            (uv.y > 0.7 && uv.y < 0.702) ||
                            (uv.y > 0.9 && uv.y < 0.902) ||
                            (uv.x > 0.0 && uv.x < 0.002) ||
                            (uv.x > 0.5 && uv.x < 0.502) ||
                            (uv.x > 0.25 && uv.x < 0.252) ||
                            (uv.x > 0.75 && uv.x < 0.752)
                        ) {
                            material.diffuse = color.rgb;
                            material.alpha = 1.0;
                        }
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
        color: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
        speed: 1.0,
    };
}
