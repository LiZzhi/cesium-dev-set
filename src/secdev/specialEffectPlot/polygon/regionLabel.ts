import {Cartesian3, DataSource, Entity, Viewer} from 'cesium';

export function outsideRegionEntities(feature: any) {
    const entities:Entity[] = [];
    for (let i = 0; i < feature.length; i++) {
        const f = feature[i];
        let degreesArrayHeights = getDegreesArrayHeights(f);
        let e = new Cesium.Entity({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                    getDegreesArrayHeights(f, 500)
                ),
                width: 3,
            },
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights)),
                height: 0,
                material: new Cesium.ImageMaterialProperty({
                    image: require("../../assets/img/regionLabel/darkBlue.png"),
                    repeat: new Cesium.Cartesian2(10, 10),
                })
            }
        });
        entities.push(e);
    }
    return entities;
}

export function insidePolylineEntities(feature: any) {
    const entities:Entity[] = [];
    for (let i = 0; i < feature.length; i++) {
        const f = feature[i];
        let degreesArrayHeights = getDegreesArrayHeights(f, 1e4);
        let e1 = new Cesium.Entity({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights),
                width: 3,
                material: Cesium.Color.fromCssColorString('#ccc').withAlpha(0.4)
            }
        });
        let n = Cesium.Cartographic.fromCartesian(
            Cesium.BoundingSphere.fromPoints(
                Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights)
            ).center
        );
        let l = Cesium.Math.toDegrees(n.longitude);
        let a = Cesium.Math.toDegrees(n.latitude);
        let e2 = new Cesium.Entity({
            position: Cesium.Cartesian3.fromDegrees(l, a, 12e3),
            label: {
                text: f.properties.name,
                fillColor: Cesium.Color.WHITE,
                scale: 0.5,
                font: 'normal 84px MicroSoft YaHei',
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0,
                    9000000
                ),
                scaleByDistance: new Cesium.NearFarScalar(50000, 1, 500000, 0.5),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                outlineWidth: 20,
                outlineColor: Cesium.Color.BLACK
            }
        });
        entities.push(e1);
        entities.push(e2);
    }
    return entities;
}

export function insideRegionEntities(feature: any) {
    const entities:Entity[] = [];
    for (let i = 0; i < feature.length; i++) {
        const f = feature[i];
        let degreesArrayHeights = getDegreesArrayHeights(f);
        let e = new Cesium.Entity({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights)),
                //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2e6),
                height: 1e4,
                //material: Cesium.Color.fromCssColorString("#2C577A").withAlpha(0.96)
                material: new Cesium.ImageMaterialProperty({
                    image: require("../../assets/img/regionLabel/darkBlue.png"),
                    repeat: new Cesium.Cartesian2(0, 1),
                    color: Cesium.Color.fromCssColorString('#2F5981').withAlpha(0.8)
                })
            },
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                    getDegreesArrayHeights(f, 1e4)
                ),
                material: new Cesium.ImageMaterialProperty({
                    image: require("../../assets/img/regionLabel/wallgradients.png"),
                    repeat: new Cesium.Cartesian2(0, 1),
                    transparent: true,
                    color: Cesium.Color.fromCssColorString('#106C9D')
                })
            }
        });
        entities.push(e);
    }
    return entities;
}



    //获取坐标串
function getDegreesArrayHeights(feature: any, height: number=0) {
    let degreesArrayHeights: number[] = [];
    let coordinates;
    if (feature.geometry.type == 'MultiPolygon') {
        coordinates = feature.geometry.coordinates[0][0];
    } else if (feature.geometry.type == 'Polygon') {
        coordinates = feature.geometry.coordinates[0];
    }
    //坐标串转为需要的格式[x,y,z,x,y,z....]
    for (let i = 0; i < coordinates.length; i++) {
        const element = coordinates[i];
        degreesArrayHeights.push(element[0]);
        degreesArrayHeights.push(element[1]);
        degreesArrayHeights.push(height);
    }
    return degreesArrayHeights;
}
