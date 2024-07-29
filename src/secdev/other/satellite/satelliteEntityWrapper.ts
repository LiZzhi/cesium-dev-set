import { Entity, Viewer, Matrix4, Cartesian3, JulianDate, CallbackProperty } from "cesium";
import satelliteProperties from "./satelliteProperties";
import satelliteComponents from "./satelliteComponents";

export default class satelliteEntityWrapper {
    #viewer: Viewer;
    point: Entity;
    model: Entity;
    image: Entity;
    label: Entity;
    orbit: Entity;
    cone: Entity;
    squareCone: Entity;
    groundTrack: Entity;
    props: satelliteProperties;
    nowPositions: CallbackProperty;
    entities: { [propName: string]: { entity: Entity; show: boolean } };
    constructor(viewer: Viewer, props: satelliteProperties) {
        this.#viewer = viewer;

        this.props = props; // 卫星属性

        this.point = this.#createEntity(); // 点
        this.model = this.#createEntity(); // 卫星模型
        this.image = this.#createEntity(); // 卫星图片
        this.label = this.#createEntity(); // 卫星名称
        this.orbit = this.#createEntity(); // 卫星轨道
        this.cone = this.#createEntity(); // 卫星圆锥形波束
        this.squareCone = this.#createEntity(); // 卫星方锥形波束
        this.groundTrack = this.#createEntity(); // 卫星地面扫描线

        this.entities = {
            [satelliteComponents.Point]: { entity: this.point, show: false },
            [satelliteComponents.Model]: { entity: this.model, show: false },
            [satelliteComponents.SatImage]: { entity: this.image, show: false },
            [satelliteComponents.Label]: { entity: this.label, show: false },
            [satelliteComponents.Orbit]: { entity: this.orbit, show: false },
            [satelliteComponents.SensorCone]: {
                entity: this.cone,
                show: false,
            },
            [satelliteComponents.SensorSquareCone]: {
                entity: this.squareCone,
                show: false,
            },
            [satelliteComponents.GroundTrack]: {
                entity: this.groundTrack,
                show: false,
            },
        };

        this.nowPositions = new Cesium.CallbackProperty(()=>{}, true);
    }

    /**
     * @description: 添加entity属性
     * @return {*}
     */
    createSatEntity() {
        this.nowPositions = new Cesium.CallbackProperty((time)=>{
            return this.#calculateNowPosition(time);
        }, false);
        this.#createPoint();
        this.#createModel();
        this.#createImage();
        this.#createLabel();
        this.#createOrbit();
        this.#createCone();
        this.#createSquareCone();
        this.#createGroundTrack();
    }

    #createEntity() {
        return new Entity({
            name: this.props.name,
            viewFrom: new Cesium.ConstantProperty(
                new Cesium.Cartesian3(0, -3600000, 4200000)
            ),
        });
    }

    #createPoint() {
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
            image: require("../../assets/img/satellite/satelliteO.png"),
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
            font: "30px 黑体",
            fillColor: Cesium.Color.AQUA,
            scale: 0.5,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(15, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                10000,
                2.0e7
            ),
            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                1.0e1,
                10,
                2.0e5,
                1
            ),
        });
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
        });
    }

    #createCone() {
        this.cone.position = this.props.conSampledPosition;
        this.cone.orientation = new Cesium.CallbackProperty((time) => {
            return this.#calculateOrientation(time);
        }, false);
        const startTime = this.#viewer.clock.currentTime;
        let positions = this.#calculateNowPosition(startTime);
        let xDis = Cesium.Cartesian3.distance(positions[0], positions[1]);
        // let yDis = Cesium.Cartesian3.distance(positions[1], positions[2]);
        let height: number;
        this.cone.cylinder = new Cesium.CylinderGraphics({
            length: new Cesium.CallbackProperty((time) => {
                let s = this.props.sampledPosition;
                let c3 = s.getValue(time);
                height = Cesium.Cartographic.fromCartesian(c3!).height;
                return height;
            }, false),
            material: new Cesium.ColorMaterialProperty(
                Cesium.Color.ORANGE.withAlpha(0.3)
            ),
            topRadius: xDis / 2,
            bottomRadius: 1,
        });
    }

    #createSquareCone() {
        this.squareCone.polyline = new Cesium.PolylineGraphics({
            material: new Cesium.ColorMaterialProperty(
                Cesium.Color.ORANGE
            ),
            positions: new Cesium.CallbackProperty((time) => {
                let position =this.props.position(time);
                let nowPositions = this.nowPositions.getValue(time);
                return [
                    position,
                    nowPositions[2],
                    nowPositions[1],
                    position,
                ];
            }, false),
            arcType: Cesium.ArcType.NONE,
        })
        this.squareCone.polygon = new Cesium.PolygonGraphics({
            material: new Cesium.ColorMaterialProperty(
                Cesium.Color.ORANGE.withAlpha(0.3)
            ),
            hierarchy: new Cesium.CallbackProperty((time) => {
                let position =this.props.position(time);
                let nowPositions = this.nowPositions.getValue(time);
                return new Cesium.PolygonHierarchy([
                    position,
                    nowPositions[2],
                    nowPositions[1],
                ]);
            }, false),
            perPositionHeight: true,
        })
    }

    #createGroundTrack() {
        const startTime = this.#viewer.clock.currentTime;
        let positions = this.#calculateNowPosition(startTime);
        this.groundTrack.polyline = new Cesium.PolylineGraphics({
            material: Cesium.Color.RED,
            positions: new Cesium.CallbackProperty((time) => {
                let nowPositions = this.nowPositions.getValue(time);
                return [
                    positions[0],
                    positions[3],
                    nowPositions[2],
                    nowPositions[1],
                    positions[0],
                ];
            }, false),
            clampToGround: true,
            width: 2,
            arcType: Cesium.ArcType.RHUMB,
        });
        this.groundTrack.polygon = new Cesium.PolygonGraphics({
            material: Cesium.Color.RED.withAlpha(0.2),
            arcType: Cesium.ArcType.RHUMB,
            hierarchy: new Cesium.CallbackProperty((time) => {
                let nowPositions = this.nowPositions.getValue(time);
                return new Cesium.PolygonHierarchy([
                    positions[0],
                    positions[3],
                    nowPositions[2],
                    nowPositions[1],
                ]);
            }, false),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        });
    }

    #calculateOrientation(time: JulianDate) {
        const position = this.props.position(time);
        const lastPosition = this.props.position(
            Cesium.JulianDate.addSeconds(time, -1, new Cesium.JulianDate())
        );
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        let surfacePoint = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude
        );
        let transforms =
            Cesium.Transforms.eastNorthUpToFixedFrame(surfacePoint);
        let inverseTransforms = Cesium.Matrix4.inverse(
            transforms,
            new Cesium.Matrix4()
        );
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
    }

    #calculateNowPosition(time: JulianDate, pitch = this.props.options.pitch) {
        let t = time.clone();
        const position = this.props.position(t);
        Cesium.JulianDate.addSeconds(t, -1, t);
        const lastPosition = this.props.position(t);
        return this.#calculatePosition(
            position,
            lastPosition,
            pitch,
            this.props.options.xFov / 2,
            this.props.options.yFov / 2
        );
    }

    #calculatePosition(
        position: Cartesian3,
        lastPosition: Cartesian3,
        pitch: number,
        xHalfAngle: number,
        yHalfAngle: number
    ) {
        let transforms = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        let inverseTransforms = Cesium.Matrix4.inverse(
            transforms,
            new Cesium.Matrix4()
        );
        let lastP = Cesium.Matrix4.multiplyByPoint(
            inverseTransforms,
            lastPosition,
            new Cesium.Cartesian3()
        );
        let heading = Math.atan(lastP.y / lastP.x);
        let rz3 = Cesium.Matrix3.fromRotationZ(heading, new Cesium.Matrix3());
        pitch = lastP.y > 0 ? -pitch : pitch;
        let rx3 = Cesium.Matrix3.fromRotationX(
            (pitch / 180) * Math.PI,
            new Cesium.Matrix3()
        );

        Cesium.Matrix4.multiplyByMatrix3(transforms, rz3, transforms);
        Cesium.Matrix4.multiplyByMatrix3(transforms, rx3, transforms);
        let x = Math.tan((xHalfAngle / 180) * Math.PI) * 1000;
        let y = Math.tan((yHalfAngle / 180) * Math.PI) * 1000;

        let p1 = this.#transformsPosition(transforms, position, x, y);
        let p2 = this.#transformsPosition(transforms, position, -x, y);
        let p3 = this.#transformsPosition(transforms, position, -x, -y);
        let p4 = this.#transformsPosition(transforms, position, x, -y);
        return [p1, p2, p3, p4];
    }

    #transformsPosition(
        transforms: Matrix4,
        position: Cartesian3,
        x: number,
        y: number
    ) {
        let d = Cesium.Matrix4.multiplyByPoint(
            transforms,
            new Cesium.Cartesian3(x, y, -1000),
            new Cesium.Cartesian3()
        );
        Cesium.Cartesian3.subtract(d, position, d);
        let intersection = Cesium.IntersectionTests.rayEllipsoid(
            new Cesium.Ray(position, d),
            Cesium.Ellipsoid.WGS84
        );
        return Cesium.Ray.getPoint(
            new Cesium.Ray(position, d),
            intersection.start
        );
    }
}
