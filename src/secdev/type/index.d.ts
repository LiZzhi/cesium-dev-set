// 经纬度坐标类型
export type worldDegreesType = {
    lon: number;
    lat: number;
    height?: number;
}

// 包围盒范围
export type bboxType = {
    north: number;
    east: number;
    south: number;
    west: number;
}