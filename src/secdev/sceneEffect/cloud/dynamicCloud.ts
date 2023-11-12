import { Viewer, Geometry } from "cesium";

export default function dynamicCloud(viewer: Viewer){
    let rectangle = new Cesium.RectangleGeometry({
        ellipsoid: Cesium.Ellipsoid.WGS84,
        height: 800000.0,
        rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90, 180.0, 90),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        stRotation: 0
    });

    let reactgeometry = Cesium.RectangleGeometry.createGeometry(rectangle);
    let geometry = new Cesium.GeometryInstance({
        geometry: reactgeometry as Geometry,
    });

    let cloudPrimitive = new Cesium.Primitive({
        show: true,
        geometryInstances: geometry,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false,
            material: new Cesium.Material({
                fabric: {
                    type: 'Image',
                    uniforms: {
                        image: require("../../assets/img/cloud/cloud.png"),
                        radians: 90
                    }
                }
            })
        }),
        asynchronous: false, // 确定图元是异步创建还是阻塞直到准备就绪
        compressVertices: false // 启用顶点压缩

    });

    viewer.scene.primitives.add(cloudPrimitive);
    let interVal = setInterval(function() {
        let anglex = 0.05;
        // 获取模型当前的变换矩阵
        let m = cloudPrimitive.modelMatrix;
        // 获取计算绕某轴旋转的3X3变换矩阵
        let rotationM = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(anglex));
        // 计算矩阵4的变换矩阵（在原变换中，累加变换）
        let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(m, rotationM, new Cesium.Matrix4());
        cloudPrimitive.modelMatrix = newMatrix4;
    }, 100);

    return { cloudPrimitive, interVal }
}