import { Cartesian3, Cartographic } from "cesium"

export default function fromDegreesToCartesian3Arr(arr: Cartographic[]):Cartesian3[]{
    let arrC3:Cartesian3[] = []
    arr.forEach(v=>{
        let c = Cesium.Cartesian3.fromDegrees(v.longitude, v.latitude, v.height);
        arrC3.push(c)
    })
    return arrC3
}