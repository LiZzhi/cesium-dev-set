import { Entity } from "cesium";
import satelliteProperties from "./satelliteProperties";
import satelliteComponents from "./satelliteComponents";

export default class satelliteEntityWrapper {
    point: Entity;
    model: Entity;
    image: Entity;
    label: Entity;
    orbit: Entity;
    cone: Entity;
    props: satelliteProperties;

    entities: {[propName: string]: { entity: Entity, show: boolean}};
    constructor(props: satelliteProperties){
        this.props = props; // 卫星属性

        this.point = this.#createEntity();   // 点
        this.model = this.#createEntity();   // 卫星模型
        this.image = this.#createEntity();   // 卫星图片
        this.label = this.#createEntity();   // 卫星名称
        this.orbit = this.#createEntity();   // 卫星轨道
        this.cone = this.#createEntity();    // 卫星圆锥形波束

        this.entities = {
            [satelliteComponents.Point]: {entity: this.point, show: false},
            [satelliteComponents.Model]: {entity: this.model, show: false},
            [satelliteComponents.SatImage]: {entity: this.image, show: false},
            [satelliteComponents.Label]: {entity: this.label, show: false},
            [satelliteComponents.Orbit]: {entity: this.orbit, show: false},
            [satelliteComponents.SensorCone]: {entity: this.cone, show: false},
        }
    }

    /**
     * @description: 添加entity属性
     * @return {*}
     */
    createSatEntity(){
        this.#createPoint();
        this.#createModel();
        this.#createImage();
        this.#createLabel();
        this.#createOrbit();
        this.#createCone();
    }

    #createEntity(){
        return new Entity({
            name: this.props.name,
            viewFrom: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, -3600000, 4200000)),
        })
    }

    #createPoint(){
        this.point.position = this.props.sampledPosition;
        this.point.point = new Cesium.PointGraphics({
            pixelSize: 10,
            color: Cesium.Color.WHITE,
        });
    }

    #createModel() {
        this.model.position = this.props.sampledPosition;
        this.model.model = new Cesium.ModelGraphics({
            uri: require("../../assets/gltf/satellite.glb"),
        });
    }

    #createImage() {
        this.image.position = this.props.sampledPosition;
        this.image.billboard = new Cesium.BillboardGraphics({
            image:require("../../assets/img/satellite/satelliteO.png"),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            height: 24,
            width: 24,
        });
    }

    #createLabel() {
        this.label.position = this.props.sampledPosition;
        this.label.label = new Cesium.LabelGraphics({
            text: this.props.name,
            font: '30px 黑体',
            fillColor: Cesium.Color.AQUA,
            scale: 0.5,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(15, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10000, 2.0e7),
            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e1, 10, 2.0e5, 1),
        })
    }

    #createOrbit() {
        this.orbit.position = this.props.sampledPosition;
        this.orbit.path = new Cesium.PathGraphics({
            leadTime: (this.props.orbit.orbitalPeriod * 60) / 2 + 5,
            trailTime: (this.props.orbit.orbitalPeriod * 60) / 2 + 5,
            // material: new Cesium.PolylineGlowMaterialProperty({
            //     glowPower: 0.2,
            //     taperPower: 0.5,
            //     color: Cesium.Color.CORNFLOWERBLUE,
            // }),
            material: Cesium.Color.fromRandom({
                alpha: 1.0,
            }),
            resolution: 600,
            // width: 5,
            width: 1,
        })
    }

    #createCone() {
        this.cone.position = this.props.conSampledPosition;
        this.cone.orientation = new Cesium.CallbackProperty((time) => {
            const position = this.props.position(time!);
            const lastPosition = this.props.position(
                Cesium.JulianDate.addSeconds(time!, -1, new Cesium.JulianDate())
            );
            const cartographic = Cesium.Cartographic.fromCartesian(position);
            let surfacePoint = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude
            );
            let transforms = Cesium.Transforms.eastNorthUpToFixedFrame(surfacePoint);
            let inverseTransforms = Cesium.Matrix4.inverse(transforms, new Cesium.Matrix4());
            let p1 = Cesium.Matrix4.multiplyByPoint(
                inverseTransforms,
                position,
                new Cesium.Cartesian3()
            );
            let p2 = Cesium.Matrix4.multiplyByPoint(
                inverseTransforms,
                lastPosition,
                new Cesium.Cartesian3()
            );
            let radius = Math.atan((p1.x - p2.x) / (p1.y - p2.y));
            const hpr = new Cesium.HeadingPitchRoll(
                radius,
                Cesium.Math.toRadians(180 + this.props.options.pitch),
                Cesium.Math.toRadians(this.props.options.roll)
            );
            return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        }, false)

        let height: number;
        this.cone.cylinder = new Cesium.CylinderGraphics({
            length: new Cesium.CallbackProperty((time)=>{
                let s = this.props.sampledPosition;
                let c3 = s.getValue(time!);
                height = Cesium.Cartographic.fromCartesian(c3).height;
                return height;
            }, false),
            material: new Cesium.ColorMaterialProperty(Cesium.Color.ORANGE.withAlpha(0.3)),
            topRadius:new Cesium.CallbackProperty(()=>{
                return height * Math.tan(Cesium.Math.toRadians(this.props.options.fov));
            }, false),
            bottomRadius: 1,
        })
    }
}