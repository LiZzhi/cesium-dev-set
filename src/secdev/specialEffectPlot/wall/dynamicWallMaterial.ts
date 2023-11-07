import { Color } from "cesium";

export type dynamicWallOptions = {
    type: "vertical"|"horizontal",
    color: Color;
    speed: number;
    image: string;
    imageCount: number;
    direction: boolean;
}

export default function dynamicWallMaterial(options: Partial<dynamicWallOptions>){
    let o: dynamicWallOptions = Object.assign({
        type: "vertical",
        color: Cesium.Color.CYAN,
        speed: 10,
        image: require("../../assets/img/wall/defaultWall.png"),
        imageCount: 2,
        direction: false,
    }, options);

    let m = new Cesium.Material({
        fabric: {
            uniforms: {
                color: o.color,
                image: o.image,
                time: o.speed
            },
            source: _getDirectionWallShader(o)
        },
    });
    return m;
}

function _getDirectionWallShader(options: Partial<dynamicWallOptions>) {
    let direction = options.direction?'+':'-';
    let typeShader = "";
    if (options.type == 'vertical') {
        // 纵向
        typeShader = `vec2(fract(st.s), fract(float(${options.imageCount})*st.t ${direction} time*czm_frameNumber*0.005))`;
    } else {
        // 横向
        typeShader = `vec2(fract(float(${options.imageCount})*st.s ${direction} time*czm_frameNumber*0.005), fract(st.t))`;
    }
    let materail = `
        czm_material czm_getMaterial(czm_materialInput materialInput){
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            vec4 colorImage = texture2D(image, ${typeShader});
            vec4 fragColor;
            fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;
            fragColor = czm_gammaCorrect(fragColor);
            material.diffuse = colorImage.rgb;
            material.alpha = colorImage.a;
            material.emission = fragColor.rgb;
            return material;
        }
    `
    return materail;
}