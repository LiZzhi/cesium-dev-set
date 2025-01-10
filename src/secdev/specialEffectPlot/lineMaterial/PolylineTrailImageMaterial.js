export default class PolylineTrailImageMaterialProperty {
    constructor(options) {
        options = Cesium.defaultValue(
            options,
            Cesium.defaultValue.EMPTY_OBJECT
        );
        this._definitionChanged = new Cesium.Event();
        this._duration = options.duration;
        this._trailImage = options.trailImage;
        this._time = performance.now();
    }
}

if (window.Cesium) {
    Object.defineProperties(PolylineTrailImageMaterialProperty.prototype, {
		isConstant: {
            get: function () {
                return false;
            }
        },
		definitionChanged: {
            get: function () {
                return this._definitionChanged;
            },
        },
        image: Cesium.createPropertyDescriptor("image"),
    });

    PolylineTrailImageMaterialProperty.prototype.getType = function (time) {
        return "PolylineTrailImage";
    };

    PolylineTrailImageMaterialProperty.prototype.getValue = function (
        time,
        result
    ) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.image = this._trailImage || require("../../assets/img/lineMaterial/orangeLine.png"),
        result.time =
            ((performance.now() - this._time) % this._duration) /
            this._duration;
        return result;
    };

    PolylineTrailImageMaterialProperty.prototype.equals = function (other) {
        return this === other || (
			other instanceof PolylineTrailImageMaterialProperty &&
			this._trailImage === other._trailImage
		)
    };
    Cesium.Material.PolylineTrailImageType = "PolylineTrailImage";
    Cesium.Material._materialCache.addMaterial(
        Cesium.Material.PolylineTrailImageType,
        {
            fabric: {
                type: Cesium.Material.PolylineTrailImageType,
                uniforms: {
                    image: require("../../assets/img/lineMaterial/orangeLine.png"),
                    time: 0,
                },
                components: {
                    diffuse:
                        "texture2D(image, vec2(fract(materialInput.st.s-time), materialInput.st.t)).rgb",
                    alpha: "texture2D(image, vec2(fract(materialInput.st.s-time), materialInput.st.t)).a",
                },
            },

            translucent: function (material) {
                return true;
            },
        }
    );
}
