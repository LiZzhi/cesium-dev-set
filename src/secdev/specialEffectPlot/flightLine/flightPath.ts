export type flightOptionType = {
    h: number;  // 中点高度
    interpolationNum: number;   // 插值次数
};

/**
 * @description: 计算贝塞尔弧线
 * @param {number[]} start 起点, [lon, lat]
 * @param {number[]} end 终点, [lon, lat]
 * @param {flightOptionType} options 配置项
 * @return {*}
 */
export default function flightPositions(
    start: number[],
    end: number[],
    options: Partial<flightOptionType>
) {
    let o: flightOptionType = Object.assign(
        {
            h: 10000,
            interpolationNum: 100,
        },
        options
    );
    let [x1, y1] = start;
    let [x2, y2] = end;
    let startPoint = [y1, 0];
    let midPoint = [(y2 + y1) / 2, o.h];
    let endPoint = [y2, 0];
    let arr = getBSR(startPoint, midPoint, endPoint, o.interpolationNum);
    let arr3d = [];
    for (let i = 0; i < arr.length; i++) {
        let x = ((x2 - x1) * (arr[i][0] - y1)) / (y2 - y1) + x1;
        arr3d.push([x, arr[i][0], arr[i][1]]);
    }
    let arrAll: number[] = [];
    arr3d.forEach((v) => {
        arrAll.push(v[0]);
        arrAll.push(v[1]);
        arrAll.push(v[2]);
    });
    return Cesium.Cartesian3.fromDegreesArrayHeights(arrAll);
}

function getBSR(
    start: number[],
    mid: number[],
    end: number[],
    interpolationNum = 100
) {
    let ps = [
        { x: start[0], y: start[1] },
        { x: mid[0], y: mid[1] },
        { x: end[0], y: end[1] },
    ];
    let points = [];
    for (let i = 0; i < interpolationNum; i++) {
        let len = ps.length;
        let x = 0;
        let y = 0;
        let t = i / interpolationNum;
        for (let j = 0; j < len; j++) {
            let point = ps[j];
            x +=
                point.x *
                Math.pow(1 - t, len - 1 - j) *
                Math.pow(t, j) *
                erxiangshi(len - 1, j);
            y +=
                point.y *
                Math.pow(1 - t, len - 1 - j) *
                Math.pow(t, j) *
                erxiangshi(len - 1, j);
        }
        points.push([x, y]);
    }
    return points;
}

function erxiangshi(start: number, end: number) {
    let cs = 1;
    let bcs = 1;
    while (end > 0) {
        cs *= start;
        bcs *= end;
        start--;
        end--;
    }
    return cs / bcs;
}
