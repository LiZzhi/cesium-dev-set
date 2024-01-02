export function OperateCtrlPts(ctrlPts) {
    // 处理后控制点
    let OperatePts = ctrlPts;
    let tcount = OperatePts.length;
    // 三个点时，构造成四个点，添加的点为三点构成三角形的中点
    if (tcount == 3) {
        let dCenterX = ((OperatePts[0][0] + OperatePts[1][0]) / 2 + OperatePts[2][0]) / 2;
        let dCenterY = ((OperatePts[0][1] + OperatePts[1][1]) / 2 + OperatePts[2][1]) / 2;
        let ptCenter = [dCenterX, dCenterY];
        let ptTemp = OperatePts[2];
        OperatePts[2] = ptCenter;
        OperatePts[3] = ptTemp;
    }

    return OperatePts;
}

export function GenArrowBodyPts(
    ArrowBodyLen,
    OpectrlPoints,
    ArrowBodyLeftPts,
    ArrowBodyRightPts,
    ArrowBodyLeftPtsLeftCtrlPts,
    ArrowBodyLeftPtsRightCtrlPts,
    ArrowBodyRightPtsLeftCtrlPts,
    ArrowBodyRightPtsRightCtrlPts
) {
    let ctrlPntCount = OpectrlPoints.length - 1;

    let ArrowTouLenDiviedByArrowBodyLen = 0.9;
    let ArrowJingWidDiviedByArrowTouLen = 0.148;
    let ArrowErWidDividedByArrowTouLen = 0.4;
    let ArrowErLenDividedByArrowTouLen = 0.312;

    // 求取0-1点中点两侧两点
    let Center01X = (OpectrlPoints[0][0] + OpectrlPoints[1][0]) / 2;
    let Center01Y = (OpectrlPoints[0][1] + OpectrlPoints[1][1]) / 2;
    let TempX = Math.abs(Center01X - OpectrlPoints[2][0]);
    let TempY = Math.abs(Center01Y - OpectrlPoints[2][1]);

    let dDis = 0.0;
    if (TempX > 0 && TempY > 0) {
        let a = 1.0 / (Center01X - OpectrlPoints[2][0]);
        let b = -1.0 / (Center01Y - OpectrlPoints[2][1]);
        let c =
            OpectrlPoints[2][1] / (Center01Y - OpectrlPoints[2][1]) -
            OpectrlPoints[2][0] / (Center01X - OpectrlPoints[2][0]);
        dDis =
            Math.abs(a * OpectrlPoints[0][0] + b * OpectrlPoints[0][1] + c) /
            Math.sqrt(a * a + b * b);
    } else {
        if (TempY <= 0.0001) {
            dDis = Math.abs(Center01Y - OpectrlPoints[1][1]);
        } else if (TempX <= 0.0001) {
            dDis = Math.abs(Center01X - OpectrlPoints[1][0]);
        }
    }

    // 求出物理1,2点 xl,yl; xr,yr
    let [lx, ly, rx, ry] = GetSidePointsOfLine(
        dDis,
        OpectrlPoints[2][0],
        OpectrlPoints[2][1],
        Center01X,
        Center01Y
    );
    if (
        PointIsRightToLine(
            OpectrlPoints[1][0],
            OpectrlPoints[1][1],
            OpectrlPoints[2][0],
            OpectrlPoints[2][1],
            OpectrlPoints[0][0],
            OpectrlPoints[0][1]
        )
    ) {
        ArrowBodyLeftPts[1] = OpectrlPoints[1];
        ArrowBodyRightPts[1] = OpectrlPoints[0];
    } else {
        ArrowBodyLeftPts[1] = OpectrlPoints[0];
        ArrowBodyRightPts[1] = OpectrlPoints[1];
    }
    OpectrlPoints[1] = [
        (OpectrlPoints[0][0] + OpectrlPoints[1][0]) / 2,
        (OpectrlPoints[0][1] + OpectrlPoints[1][1]) / 2,
    ];

    // 箭头宽为箭尾宽的一半
    // 箭头长度改边算法
    // 如果时默认比例
    let ArrowTouWid = Math.sqrt((lx - rx) * (lx - rx) + (ly - ry) * (ly - ry)) * 0.5;
    // let ArrowTouLen = ArrowTouWid * 1.35;      //箭头长
    // let ArrowJingWid = ArrowTouLen * ArrowJingWidDiviedByArrowTouLen;     //半边箭颈宽
    // if (Math.abs(ArrowTouLenDiviedByArrowBodyLen) > 1E-10)
    // {
    let ArrowTouLen = ArrowBodyLen * ArrowTouLenDiviedByArrowBodyLen;
    let ArrowJingWid = ArrowTouLen * ArrowJingWidDiviedByArrowTouLen;
    // }

    let l1 = ComputeDistance2(
        OpectrlPoints[ctrlPntCount],
        OpectrlPoints[ctrlPntCount - 1]
    );
    let l2 = ArrowTouLen * 2;
    if (l1 < l2) {
        ArrowTouLen = l1 / 2; // 改变大小
        // added by gaozhj 原始算法中对Aw_w值未进行调整
        // Aw_w = At_l/1.35;
        ArrowJingWid = ArrowTouLen * ArrowJingWidDiviedByArrowTouLen;
    }

    // 顺延顶点
    OpectrlPoints.push(OpectrlPoints[ctrlPntCount]);

    let Len1 = 0,
        Len2 = 0;
    let i = 0;
    //! brief 拐点宽度
    let gd_w = new Array(128);
    for (i = 2; i <= ctrlPntCount; i++) {
        Len1 += ComputeDistance2(OpectrlPoints[i], OpectrlPoints[i - 1]);
    }
    Len1 -= ArrowTouLen;

    for (i = 2; i <= ctrlPntCount - 1; i++) {
        Len2 += ComputeDistance2(OpectrlPoints[i], OpectrlPoints[i - 1]);
        gd_w[i] = ArrowJingWid + (ArrowTouWid - ArrowJingWid) * Math.pow((Len1 - Len2) / Len1, 1.5); // 半边拐点宽
    }
    gd_w[ctrlPntCount] = ArrowJingWid;

    let snx, sny, dx1, dy1, dx2, dy2;
    // 求当前点 s[i] 的两侧折线拐点 p[i],q[i]----------
    for (i = 2; i <= ctrlPntCount - 1; i++) {
        // --------xl-xr为s[i-1]-s[i+1]的平行线--------
        [lx, ly, rx, ry] = GetPointsByTriangle(
            0,
            3.0,
            OpectrlPoints[i - 1][0],
            OpectrlPoints[i - 1][1],
            OpectrlPoints[i][0],
            OpectrlPoints[i][1],
            OpectrlPoints[i + 1][0],
            OpectrlPoints[i + 1][1]
        );

        // ---------修正箭颈方向(0.4或0.5)--------
        if (i === ctrlPntCount - 1) {
            [snx, sny] = GetPointsByTrapezoid(
                0.5,
                OpectrlPoints[ctrlPntCount][0],
                OpectrlPoints[ctrlPntCount][1],
                OpectrlPoints[ctrlPntCount - 1][0],
                OpectrlPoints[ctrlPntCount - 1][1],
                rx,
                ry
            );
        }

        // ---------求平行线两侧的拐点---------
        // 修改 [1/6/2009 16:35 gaozhj]
        [dx1, dy1, dx2, dy2] = GetSidePointsOfLine(
            gd_w[i],
            lx,
            ly,
            OpectrlPoints[i][0],
            OpectrlPoints[i][1]
        );
        if (PointIsRightToLine(rx, ry, lx, ly, dx1, dy1)) {
            ArrowBodyLeftPts[i] = [dx1, dy1];
            ArrowBodyRightPts[i] = [dx2, dy2];
        } else {
            ArrowBodyRightPts[i] = [dx1, dy1];
            ArrowBodyLeftPts[i] = [dx2, dy2];
        }
    }

    // --------求箭颈点 s[n1] (按上面求的修正箭颈方向的结果snx,sny)--------
    let dLen = Math.sqrt(
        1.0 * (OpectrlPoints[ctrlPntCount][0] - snx) * (OpectrlPoints[ctrlPntCount][0] - snx) +
            1.0 * (OpectrlPoints[ctrlPntCount][1] - sny) * (OpectrlPoints[ctrlPntCount][1] - sny)
    );
    // 修改原来参数从1.0改为0
    if (dLen > 0) {
        [dx1, dy1] = GetIncentrePointOnSegmentByScale(
            ArrowTouLen,
            OpectrlPoints[ctrlPntCount][0],
            OpectrlPoints[ctrlPntCount][1],
            snx,
            sny
        );
        OpectrlPoints[ctrlPntCount] = [dx1, dy1];
    }

    // --------求箭颈点 s[n1] 的两拐点 p[n1],q[n1]----------
    [dx1, dy1, dx2, dy2] = GetSidePointsOfLine(
        ArrowJingWid,
        OpectrlPoints[ctrlPntCount + 1][0],
        OpectrlPoints[ctrlPntCount + 1][1],
        OpectrlPoints[ctrlPntCount][0],
        OpectrlPoints[ctrlPntCount][1]
    );

    if (
        PointIsRightToLine(
            OpectrlPoints[ctrlPntCount][0],
            OpectrlPoints[ctrlPntCount][1],
            OpectrlPoints[ctrlPntCount + 1][0],
            OpectrlPoints[ctrlPntCount + 1][1],
            dx2,
            dy2
        )
    ) {
        ArrowBodyRightPts[ctrlPntCount] = [dx2, dy2];
        ArrowBodyLeftPts[ctrlPntCount] = [dx1, dy1];
    } else {
        ArrowBodyLeftPts[ctrlPntCount] = [dx2, dy2];
        ArrowBodyRightPts[ctrlPntCount] = [dx1, dy1];
    }

    // 求箭身的拟合曲线
    // 求箭身曲线的左右控制点
    let x0, y0;
    for (i = 2; i < ctrlPntCount; i++) {
        ArrowBodyLeftPtsLeftCtrlPts[i] = [];
        ArrowBodyLeftPtsRightCtrlPts[i] = [];
        ArrowBodyRightPtsLeftCtrlPts[i] = [];
        ArrowBodyRightPtsRightCtrlPts[i] = [];
        [
            ArrowBodyLeftPtsLeftCtrlPts[i][0],
            ArrowBodyLeftPtsLeftCtrlPts[i][1],
            ArrowBodyLeftPtsRightCtrlPts[i][0],
            ArrowBodyLeftPtsRightCtrlPts[i][1],
        ] = GetPointsByTriangle(
            3,
            3,
            ArrowBodyLeftPts[i - 1][0],
            ArrowBodyLeftPts[i - 1][1],
            ArrowBodyLeftPts[i][0],
            ArrowBodyLeftPts[i][1],
            ArrowBodyLeftPts[i + 1][0],
            ArrowBodyLeftPts[i + 1][1]
        );
        [
            ArrowBodyRightPtsLeftCtrlPts[i][0],
            ArrowBodyRightPtsLeftCtrlPts[i][1],
            ArrowBodyRightPtsRightCtrlPts[i][0],
            ArrowBodyRightPtsRightCtrlPts[i][1],
        ] = GetPointsByTriangle(
            3,
            3,
            ArrowBodyRightPts[i - 1][0],
            ArrowBodyRightPts[i - 1][1],
            ArrowBodyRightPts[i][0],
            ArrowBodyRightPts[i][1],
            ArrowBodyRightPts[i + 1][0],
            ArrowBodyRightPts[i + 1][1]
        );
        if (i === 2) {
            // ---------当在起点时，求对应控制点----------
            ArrowBodyLeftPtsRightCtrlPts[1] = GetPointsByTrapezoid(
                0.5,
                ArrowBodyLeftPts[1][0],
                ArrowBodyLeftPts[1][1],
                ArrowBodyLeftPts[2][0],
                ArrowBodyLeftPts[2][1],
                ArrowBodyLeftPtsLeftCtrlPts[2][0],
                ArrowBodyLeftPtsLeftCtrlPts[2][1]
            );
            ArrowBodyRightPtsRightCtrlPts[1] = GetPointsByTrapezoid(
                0.5,
                ArrowBodyRightPts[1][0],
                ArrowBodyRightPts[1][1],
                ArrowBodyRightPts[2][0],
                ArrowBodyRightPts[2][1],
                ArrowBodyRightPtsLeftCtrlPts[2][0],
                ArrowBodyRightPtsLeftCtrlPts[2][1]
            );
        }
        // 错误，当只有3个点时，此处不操作
        // else if (i == ctrlPntCount -1)
        if (i === ctrlPntCount - 1) {
            // ---------当在箭颈时，求控制点(强行顺箭头方向)----------
            l1 = ComputeDistance2(
                ArrowBodyLeftPts[ctrlPntCount],
                ArrowBodyLeftPts[ctrlPntCount - 1]
            );
            l2 = l1 / 3.0;
            // x0 = y0 = 0.0;
            [x0, y0] = GetExcentrePointOnSegmentByScale(
                l2,
                OpectrlPoints[ctrlPntCount][0],
                OpectrlPoints[ctrlPntCount][1],
                OpectrlPoints[ctrlPntCount + 1][0],
                OpectrlPoints[ctrlPntCount + 1][1]
            );
            x0 += ArrowBodyLeftPts[ctrlPntCount][0] - OpectrlPoints[ctrlPntCount][0];
            y0 += ArrowBodyLeftPts[ctrlPntCount][1] - OpectrlPoints[ctrlPntCount][1];
            l1 = ArrowTouWid - ArrowJingWid;
            l2 = l1 * Math.pow(l2 / Len1, 1.5);
            [rx, ry, lx, ly] = GetSidePointsOfLine(
                l2,
                ArrowBodyLeftPts[ctrlPntCount][0],
                ArrowBodyLeftPts[ctrlPntCount][1],
                x0,
                y0
            );
            ArrowBodyLeftPtsLeftCtrlPts[ctrlPntCount] = [lx, ly];

            l1 = ComputeDistance2(
                ArrowBodyRightPts[ctrlPntCount],
                ArrowBodyRightPts[ctrlPntCount - 1]
            );
            l2 = l1 / 3.0;
            [x0, y0] = GetExcentrePointOnSegmentByScale(
                l2,
                OpectrlPoints[ctrlPntCount][0],
                OpectrlPoints[ctrlPntCount][1],
                OpectrlPoints[ctrlPntCount + 1][0],
                OpectrlPoints[ctrlPntCount + 1][1]
            );
            x0 += ArrowBodyRightPts[ctrlPntCount][0] - OpectrlPoints[ctrlPntCount][0];
            y0 += ArrowBodyRightPts[ctrlPntCount][1] - OpectrlPoints[ctrlPntCount][1];
            l1 = ArrowTouWid - ArrowJingWid;
            l2 = l1 * Math.pow(l2 / Len1, 1.5);
            [rx, ry, lx, ly] = GetSidePointsOfLine(
                l2,
                ArrowBodyRightPts[ctrlPntCount][0],
                ArrowBodyRightPts[ctrlPntCount][1],
                x0,
                y0
            );
            ArrowBodyRightPtsLeftCtrlPts[ctrlPntCount] = [rx, ry];
        }
    } // End for 求箭身曲线的左右控制点
    return ArrowTouLen;
}

export function GetSidePointsOfLine(dLen, x1, y1, x2, y2) {
    let L1 = Math.sqrt(1.0 * (x1 - x2) * (x1 - x2) + 1.0 * (y1 - y2) * (y1 - y2));
    let x = 0.0;
    let y = 0.0;
    if (L1 === 0) {
        // 防同点错,此处不会发生
        y = 0;
        x = dLen;
    } else {
        // 相当于在线段(x2,y2)-(x1,y1)上求取到(x2,y2)距离为dLen、以(x2,y2)为坐标原点的点
        x = (dLen * (x1 - x2)) / L1; // 定比并平移x0
        y = (dLen * (y1 - y2)) / L1;
    }
    let rx = -y + x2; // 求取的(x,y)点求x轴对称点,并平移(x2,y2)，恢复原坐标原点
    let ry = +x + y2;

    let lx = +y + x2; // //求取的(x,y)点求y轴对称点,并平移(x2,y2)，恢复原坐标原点
    let ly = -x + y2;
    return [rx, ry, lx, ly];
}

export function PointIsRightToLine(x1, y1, x2, y2, x3, y3) {
    x2 -= x1;
    y2 -= y1;
    x3 -= x1;
    y3 -= y1;

    // 之前算法不正确，需要进行修改
    // let centerPt = [0.0, 0.0];
    // let p2 = [x2, y2];
    // p2.Rotate(centerPt, 90 / 180 * Math.PI);

    // let p3 = [x2, y2];
    // p3.Rotate(centerPt, -90 / 180 * Math.PI);

    let xx1 = y2; // 顺时针旋转,平移回x2
    let yy1 = -x2;
    let xx2 = -y2; // 逆时针旋转,平移回x2
    let yy2 = x2;

    let L1 = 1.0 * (x3 - xx1) * (x3 - xx1) + 1.0 * (y3 - yy1) * (y3 - yy1);
    let L2 = 1.0 * (x3 - xx2) * (x3 - xx2) + 1.0 * (y3 - yy2) * (y3 - yy2);
    if (L1 > L2) {
        return true;
    } else {
        return false;
    }
}

export function GetPointsByTriangle(rate1, rate2, x1, y1, x2, y2, x3, y3) {
    let x = x2 + (x3 - x1); // 平移矢量顶
    let y = y2 + (y3 - y1);
    let x0 = 0.0;
    let y0 = 0.0;
    if (x1 === x3) {
        x0 = x1;
        y0 = y;
    } else {
        if (y1 === y3) {
            x0 = x;
            y0 = y1;
        } else {
            let k = (1.0 * (y3 - y1)) / (x3 - x1);
            let b1 = y1 - x1 * k;
            let b2 = y + x / k;
            x0 = (b2 - b1) / (k + 1.0 / k);
            y0 = k * x0 + b1;
        }
    }

    let L3 = Math.sqrt(1.0 * (x2 - x) * (x2 - x) + 1.0 * (y2 - y) * (y2 - y)); // 矢量长
    let L1 = Math.sqrt(1.0 * (x1 - x2) * (x1 - x2) + 1.0 * (y1 - y2) * (y1 - y2)); // 左边长
    let L2 = Math.sqrt(1.0 * (x2 - x3) * (x2 - x3) + 1.0 * (y2 - y3) * (y2 - y3)); // 右边长

    let rateTemp = 0.0;
    if (L1 + L2) {
        rateTemp = 1.0 + ((L2 - L1) * rate1) / (L2 + L1);
    } else {
        rateTemp = 1;
    }
    x = x0 + (x - x0) * rateTemp;
    y = y0 + (y - y0) * rateTemp;

    if (L3 == 0.0) {
        L3 = 1;
    }

    let x4 = x2 + ((x2 - x) * L1) / (rate2 * L3);
    let y4 = y2 + ((y2 - y) * L1) / (rate2 * L3);
    let x5 = x2 + ((x - x2) * L2) / (rate2 * L3);
    let y5 = y2 + ((y - y2) * L2) / (rate2 * L3);
    return [x4, y4, x5, y5];
}

export function GetPointsByTrapezoid(rate, x1, y1, x2, y2, x3, y3) {
    let xx = 0.0;
    let yy = 0.0;
    let x0 = 0.0;
    let y0 = 0.0;
    if (Math.abs(y1 - y2) == 0) {
        xx = x1 + x2 - x3;
        yy = y3;
    } else if (Math.abs(x1 - x2) == 0) {
        xx = x3;
        yy = y1 + y2 - y3;
    } else {
        let k = (1.0 * (y1 - y2)) / (x1 - x2);
        let b1 = (y2 + y1) / 2.0 + (x1 + x2) / (2.0 * k);
        let b2 = y3 - k * x3;
        xx = (b1 - b2) / (k + 1.0 / k);
        yy = k * xx + b2;
        xx = 2.0 * xx - x3;
        yy = 2.0 * yy - y3;
    }

    let L1 = Math.sqrt(1.0 * (x1 - x2) * (x1 - x2) + 1.0 * (y1 - y2) * (y1 - y2));
    let L2 = Math.sqrt(1.0 * (x1 - xx) * (x1 - xx) + 1.0 * (y1 - yy) * (y1 - yy));
    if (L1 > 0) {
        x0 = x1 + ((x2 - x1) * L2) / L1;
        y0 = y1 + ((y2 - y1) * L2) / L1;
    } else {
        x0 = x1;
        y0 = y1;
    }

    let x = x0 + (xx - x0) * rate;
    let y = y0 + (yy - y0) * rate;
    return [x, y];
}

export function GetIncentrePointOnSegmentByScale(dLen, x1, y1, x2, y2) {
    // 线段长度
    let x, y;
    let L1 = Math.sqrt(1.0 * (x1 - x2) * (x1 - x2) + 1.0 * (y1 - y2) * (y1 - y2));
    if (L1 == 0) {
        x = x1;
        y = y1;
    } else {
        x = x1 + ((x2 - x1) * dLen) / L1;
        y = y1 + ((y2 - y1) * dLen) / L1;
    }
    return [x, y];
}

export function GetExcentrePointOnSegmentByScale(dLen, x1, y1, x2, y2) {
    // 线段长度
    let x, y;
    let L1 = Math.sqrt(1.0 * (x1 - x2) * (x1 - x2) + 1.0 * (y1 - y2) * (y1 - y2));
    if (L1 == 0) {
        x = x1;
        y = y1;
    } else {
        x = x1 + ((x1 - x2) * dLen) / L1;
        y = y1 + ((y1 - y2) * dLen) / L1;
    }
    return [x, y];
}

export function GenArrBody(arrBodyVertexCount, arrBodyVertex, arrBodyLeftCtrlPts, arrBodyRightCtrlPts) {
    let tLeft = [];
    let resPts = null;
    // 箭身骨架点数不够2个就不生成箭身曲线
    if (arrBodyVertexCount < 2) {
        return resPts;
    }

    // 用Bezier连成箭身
    tLeft[0] = [arrBodyVertex[1][0], arrBodyVertex[1][1]];
    for (let i = 1; i <= arrBodyVertexCount - 1; i++) {
        tLeft[tLeft.length] = [arrBodyRightCtrlPts[i][0], arrBodyRightCtrlPts[i][1]];
        tLeft[tLeft.length] = [arrBodyLeftCtrlPts[i + 1][0], arrBodyLeftCtrlPts[i + 1][1]];
        tLeft[tLeft.length] = [arrBodyVertex[i + 1][0], arrBodyVertex[i + 1][1]];
    }
    resPts = ComputeBeizerPts(tLeft);
    return resPts;
}

export function GenAtPts(TotalCount, ArrowBodyCenterPts, ArrowTouLen) {
    let ArrowErWidDividedByArrowTouLen = 0.4;
    let ArrowErLenDividedByArrowTouLen = 0.312;

    // 根据箭耳15-20度,箭头25-30度
    let ArrowTPts = []; // 箭头点从左箭身到右箭身；
    let L2 = ArrowTouLen * ArrowErLenDividedByArrowTouLen; // 为箭耳长度
    let [TempX, TempY] = GetExcentrePointOnSegmentByScale(
        L2,
        ArrowBodyCenterPts[TotalCount][0],
        ArrowBodyCenterPts[TotalCount][1],
        ArrowBodyCenterPts[TotalCount + 1][0],
        ArrowBodyCenterPts[TotalCount + 1][1]
    ); // 两箭耳连线与中线的交点

    L2 = ArrowTouLen * ArrowErWidDividedByArrowTouLen; // L2为一侧箭耳的宽度
    let [rx, ry, lx, ly] = GetSidePointsOfLine(
        L2,
        ArrowBodyCenterPts[TotalCount + 1][0],
        ArrowBodyCenterPts[TotalCount + 1][1],
        TempX,
        TempY
    ); // 求两箭耳点
    ArrowTPts[ArrowTPts.length] = [lx, ly];
    ArrowTPts[ArrowTPts.length] = [
        ArrowBodyCenterPts[TotalCount + 1][0],
        ArrowBodyCenterPts[TotalCount + 1][1],
    ];
    ArrowTPts[ArrowTPts.length] = [rx, ry];

    return ArrowTPts;
}

export function ComputeDistance(pts) {
    let t = pts.length - 1;
    let L = 0;
    for (let i = 0; i < t; i++) {
        L += Math.sqrt(
            (pts[i][0] - pts[i + 1][0]) * (pts[i][0] - pts[i + 1][0]) +
                (pts[i][1] - pts[i + 1][1]) * (pts[i][1] - pts[i + 1][1])
        );
    }
    return L;
}

export function ComputeDistance2(p1, p2) {
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function ComputeBeizerPts(cpt, section = 20) {
    // section *= 5;
    let cptSize = cpt.length;
    let bzPoints = [];
    let a0, a1, a2, a3, b0, b1, b2, b3;
    let div = 1.0 / section;
    for (let i = 0; i < cptSize - 3; i += 3) {
        a0 = cpt[i][1];
        a1 = -3 * cpt[i][1] + 3 * cpt[i + 1][1];
        a2 = 3 * cpt[i][1] - 6 * cpt[i + 1][1] + 3 * cpt[i + 2][1];
        a3 =
            -cpt[i][1] +
            3 * cpt[i + 1][1] -
            3 * cpt[i + 2][1] +
            cpt[i + 3][1];

        b0 = cpt[i][0];
        b1 = -3 * cpt[i][0] + 3 * cpt[i + 1][0];
        b2 = 3 * cpt[i][0] - 6 * cpt[i + 1][0] + 3 * cpt[i + 2][0];
        b3 =
            -cpt[i][0] +
            3 * cpt[i + 1][0] -
            3 * cpt[i + 2][0] +
            cpt[i + 3][0];

        let t = 0;
        for (let k = 0; k < section + 1; k++, t += div) {
            let bz = [
                b0 + b1 * t + b2 * t * t + b3 * t * t * t,
                a0 + a1 * t + a2 * t * t + a3 * t * t * t,
            ];
            if (t > 1.0) {
                continue; // 剔除两段贝塞尔曲线的首位重合点
            }
            bzPoints.push(bz);
        }
    }
    return bzPoints;
}