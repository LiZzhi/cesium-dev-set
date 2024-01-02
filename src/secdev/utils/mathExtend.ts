export default class mathExtend {
    static computeDistance(p1: number[], p2: number[]) {
        let dx = p1[0] - p2[0];
        let dy = p1[1] - p2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * @description: 计算垂直线段并在线段P2端左右侧一定距离的点
     * @param {number} pt1 构成线段的点P1
     * @param {number} pt2 构成线段的点P2
     * @param {number} dis 距离
     * @return {*} 垂直线段并在线段左右侧一定距离的点
     */
    static computeLPt(pt1: number[], pt2: number[], dis: number) {
        // ma add;
        let tempPt1 = [];
        let tempPt2 = [];
        if (pt1[1] == pt2[1]) {
            tempPt1[1] = pt2[1] - dis;
            tempPt1[0] = pt2[0];
            tempPt2[1] = pt2[1] + dis;
            tempPt2[0] = pt2[0];
        } else if (pt1[0] == pt2[0]) {
            tempPt1[1] = pt2[1];
            tempPt1[0] = pt2[0] - dis;
            tempPt2[1] = pt2[1];
            tempPt2[0] = pt2[0] + dis;
        } else {
            let k = (pt1[0] - pt2[0]) / (pt1[1] - pt2[1]);
            tempPt1[1] = pt2[1] + (dis * k) / Math.sqrt(k * k + 1);
            tempPt1[0] = pt2[0] + (pt2[1] - tempPt1[1]) / k;
            tempPt2[1] = pt2[1] - (dis * k) / Math.sqrt(k * k + 1);
            tempPt2[0] = pt2[0] + (pt2[1] - tempPt2[1]) / k;
        }

        let judge =
            (pt2[1] - pt1[1]) * (tempPt1[0] - pt1[0]) -
            (pt2[0] - pt1[0]) * (tempPt1[1] - pt1[1]);

        let LRpts = null;
        if (judge <= 0) {
            LRpts = [tempPt1, tempPt2];
            // LRpts.push(tempPt2);
        } else {
            LRpts = [tempPt2, tempPt1];
            // LRpts.push(tempPt2);
            // LRpts.push(tempPt1);
        }
        return LRpts;
    }

    static computeBezierCtrPointFs(PointFs: number[][]) {
        // 三边的长度
        let D01 = mathExtend.computeDistance(PointFs[0], PointFs[1]);
        let D02 = mathExtend.computeDistance(PointFs[0], PointFs[2]);
        let D12 = mathExtend.computeDistance(PointFs[1], PointFs[2]);

        // 重新排序三角形的三个点，使新的三角形01边始终未最长边且三点按照逆时针方向排序
        let Points = null;
        if (D01 > D02 && D01 > D12) {
            if (
                mathExtend.judgePointPos(PointFs[2], PointFs[0], PointFs[1]) <=
                0
            ) {
                Points = [PointFs[0], PointFs[1], PointFs[2]];
            } else {
                Points = [PointFs[1], PointFs[0], PointFs[2]];
            }
        } else if (D02 > D12 && D02 > D01) {
            if (
                mathExtend.judgePointPos(PointFs[1], PointFs[0], PointFs[2]) <=
                0
            ) {
                Points = [PointFs[0], PointFs[2], PointFs[1]];
            } else {
                Points = [PointFs[2], PointFs[0], PointFs[1]];
            }
        } else {
            if (
                mathExtend.judgePointPos(PointFs[0], PointFs[1], PointFs[2]) <=
                0
            ) {
                Points = [PointFs[1], PointFs[2], PointFs[0]];
            } else {
                Points = [PointFs[2], PointFs[1], PointFs[0]];
            }
        }
        // 求排序后的三角形的三边长度
        let L01 = mathExtend.computeDistance(Points[0], Points[1]);
        let L02 = mathExtend.computeDistance(Points[0], Points[2]);
        let L12 = mathExtend.computeDistance(Points[1], Points[2]);
        // 求排序后的三个角的角度
        let angle0 = mathExtend.getletersectingAngle(
            Points[0],
            Points[1],
            Points[2]
        );
        let angle1 = mathExtend.getletersectingAngle(
            Points[1],
            Points[0],
            Points[2]
        );
        let angle2 = mathExtend.getletersectingAngle(
            Points[2],
            Points[1],
            Points[0]
        );

        let middle = [
            (Points[0][0] + Points[1][0]) / 2,
            (Points[0][1] + Points[1][1]) / 2,
        ];
        let MD = mathExtend.computeDistance(Points[2], middle);
        // 计算贝塞尔控制点
        let p1 = mathExtend.computeLeftPoint(Points[0], Points[1], L02 / 3);
        let p9 = mathExtend.computeRightPoint(Points[0], Points[1], L01 / 4);

        let p19_0 = mathExtend.pointRotate(p1, Points[0], 90 - angle0 / 2);
        let p19_1 = mathExtend.pointRotate(p9, Points[0], 90 - angle0 / 2);

        let p2 = mathExtend.computeRightPoint(Points[2], Points[0], L02 / 3);
        let p3 = mathExtend.computeLeftPoint(Points[2], Points[0], L12 / 3);

        let p23_0 = mathExtend.pointRotate(p2, Points[2], 90 - angle2 / 2);
        let p23_1 = mathExtend.pointRotate(p3, Points[2], 90 - angle2 / 2);
        let p4 = mathExtend.computeRightPoint(Points[1], Points[2], L12 / 3);
        let p5 = mathExtend.computeLeftPoint(Points[1], Points[2], L01 / 4);

        let p45_0 = mathExtend.pointRotate(p4, Points[1], 90 - angle1 / 2);
        let p45_1 = mathExtend.pointRotate(p5, Points[1], 90 - angle1 / 2);
        let B7 = mathExtend.computeLeftPoint(middle, Points[2], MD / 10);
        let p = mathExtend.computeLeftRightPointF(middle, Points[0], L01 / 6);
        let offsetX = B7[0] - middle[0];
        let offsetY = B7[1] - middle[1];
        let B6 = [p[0][0] + offsetX, p[0][1] + offsetY];
        let B8 = [p[1][0] + offsetX, p[1][1] + offsetY];

        let pBezier = [
            B7,
            B8,
            p19_1,
            Points[0],
            p19_0,
            p23_0,
            Points[2],
            p23_1,
            p45_0,
            Points[1],
            p45_1,
            B6,
            B7,
        ];

        return pBezier;
    }

    static judgePointPos(p: number[], p1: number[], p2: number[]) {
        // ma change置换x ,y 值;
        let f =
            (p2[1] - p1[1]) * (p[0] - p1[0]) - (p2[0] - p1[0]) * (p[1] - p1[1]);
        return f;
    }

    static getletersectingAngle(
        ptAnchor: number[],
        ptOld: number[],
        ptNew: number[]
    ) {
        if (
            (ptAnchor[0] == ptOld[0] && ptAnchor[1] == ptOld[1]) ||
            (ptNew[0] == ptAnchor[0] && ptNew[1] == ptAnchor[1]) ||
            (ptOld[0] == ptNew[0] && ptOld[1] == ptNew[1])
        ) {
            return 0;
        }
        // 公式：cosA = (AB*AC)/(|AB|*|AC|)
        let xAB = ptOld[0] - ptAnchor[0];
        let yAB = ptOld[1] - ptAnchor[1];
        let xAC = ptNew[0] - ptAnchor[0];
        let yAC = ptNew[1] - ptAnchor[1];
        let dAB = Math.sqrt(xAB * xAB + yAB * yAB);
        let dAC = Math.sqrt(xAC * xAC + yAC * yAC);
        let cos1 = (xAB * xAC + yAB * yAC) / (dAB * dAC);
        if (cos1 > 1) cos1 = 1;
        if (cos1 < -1) cos1 = -1;
        let A = (180 / Math.PI) * Math.acos(cos1);
        // -------------------1104添加
        if ((xAB * xAB + yAB * yAB) * (xAC * xAC + yAC * yAC) < 0) {
            return 360 - A;
        }
        // -------------------1104添加
        return A;
    }

    static computeLeftPoint(pt1: number[], pt2: number[], length: number) {
        // ma change;置换x ,y 值 ;
        let Point = null;
        let p1x, p1y, p2x, p2y;
        if (pt1[1] == pt2[1]) {
            p1x = pt1[1];
            p1y = pt1[0] - length;
            p2x = pt1[1];
            p2y = pt1[0] + length;
        } else {
            let k = (pt1[0] - pt2[0]) / (pt1[1] - pt2[1]);
            p1x = Math.sqrt((length * length) / (k * k + 1)) + pt1[1];
            p1y = pt1[0] + k * (p1x - pt1[1]);
            p2x = -Math.sqrt((length * length) / (k * k + 1)) + pt1[1];
            p2y = pt1[0] + k * (p2x - pt1[1]);
        }
        if (
            (p1x - pt2[1]) * (p1x - pt2[1]) + (p1y - pt2[0]) * (p1y - pt2[0]) <
            (p2x - pt2[1]) * (p2x - pt2[1]) + (p2y - pt2[0]) * (p2y - pt2[0])
        ) {
            Point = [p2y, p2x];
        } else {
            Point = [p1y, p1x];
        }
        return Point;
    }

    static computeRightPoint(p1: number[], p2: number[], length: number) {
        // ma change置换x ,y 值;
        let Point = null;
        let p1x, p1y, p2x, p2y;
        if (p1[1] == p2[1]) {
            p1x = p1[1];
            p1y = p1[0] + length;
            p2x = p1[1];
            p2y = p1[0] - length;
        } else {
            let k = (p1[0] - p2[0]) / (p1[1] - p2[1]);
            p1x = Math.sqrt((length * length) / (k * k + 1)) + p1[1];
            p1y = p1[0] + k * (p1x - p1[1]);
            p2x = -Math.sqrt((length * length) / (k * k + 1)) + p1[1];
            p2y = p1[0] + k * (p2x - p1[1]);
        }
        if (
            (p1x - p2[1]) * (p1x - p2[1]) + (p1y - p2[0]) * (p1y - p2[0]) <
            (p2x - p2[1]) * (p2x - p2[1]) + (p2y - p2[0]) * (p2y - p2[0])
        ) {
            Point = [p1y, p1x];
        } else {
            Point = [p2y, p2x];
        }
        return Point;
    }

    // 计算直线上距P1一定距离且在P1左右两边的点
    static computeLeftRightPointF(p1: number[], p2: number[], length: number) {
        let leftPoint = null;
        let rightPoint = null;
        let p1x, p1y, p2x, p2y;
        if (p1[1] == p2[1]) {
            p1x = p1[1];
            p1y = p1[0] - length;
            p2x = p1[1];
            p2y = p1[0] + length;
        } else {
            let k = (p1[0] - p2[0]) / (p1[1] - p2[1]);
            p1x = Math.sqrt((length * length) / (k * k + 1)) + p1[1];
            p1y = p1[0] + k * (p1x - p1[1]);
            p2x = -Math.sqrt((length * length) / (k * k + 1)) + p1[1];
            p2y = p1[0] + k * (p2x - p1[1]);
        }
        if (
            (p1x - p2[1]) * (p1x - p2[1]) + (p1y - p2[0]) * (p1y - p2[0]) <
            (p2x - p2[1]) * (p2x - p2[1]) + (p2y - p2[0]) * (p2y - p2[0])
        ) {
            rightPoint = [p1y, p1x];
            leftPoint = [p2y, p2x];
        } else {
            leftPoint = [p1y, p1x];
            rightPoint = [p2y, p2x];
        }

        let ppp = [leftPoint, rightPoint];

        return ppp;
    }

    static pointRotate(p1: number[], pCenter: number[], angle: number) {
        // ma modify;
        let tp = [];
        let a = p1[1] - pCenter[1];
        let b = p1[0] - pCenter[0];
        // p1[1] -= pCenter[1];
        // p1[0] -= pCenter[0];

        let al = (angle * Math.PI) / 180;
        tp[1] = a * Math.cos(al) - b * Math.sin(al) + pCenter[1];
        tp[0] = b * Math.cos(al) + a * Math.sin(al) + pCenter[0];

        return tp;
    }

    static lineType_3_0_0(pts: number[][]) {
        // 如果只有两个点则自动计算第三点（构成等腰三角形且底角为36度），否则直接用三个点计算
        let pBezier;
        if (pts.length == 2) {
            let L01 = mathExtend.computeDistance(pts[0], pts[1]);
            if (L01 == 0) {
                return pBezier;
            }
            // 当只有两个点时，自动计算第三点
            // 01两点的中点
            let middle = [
                (pts[0][0] + pts[1][0]) / 2,
                (pts[0][1] + pts[1][1]) / 2,
            ];
            // 求出第三点（上顶点）
            let vertex = mathExtend.computeLPt(
                pts[0],
                middle,
                (Math.tan(Math.PI / 5) * L01) / 2
            )[0];
            let ppp = [...pts, vertex];
            pBezier = mathExtend.computeBezierCtrPointFs(ppp as number[][]);
        } else if (pts.length == 3) {
            pBezier = mathExtend.computeBezierCtrPointFs(pts);
        }
        return pBezier;
    }

    /**
     * @description: 由控制点计算贝塞尔曲线上的点
     * @param {number} cpt 经纬度数组
     * @param {*} section
     * @return {*}
     */
    static computeBeizerPts(cpt: number[][], section = 20): number[][] {
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

    static drawArrow(p1: number[], p2: number[], p3: number[], p4: number[]) {
        let arrowPoints = [];

        let p5 = null,
            p6 = null,
            p7 = null,
            p8 = null,
            p9 = null,
            p10 = null,
            p11 = null,
            p12 = null,
            p13 = null;
        let flag2 = mathExtend.judgePointPos(p3, p1, p2);
        let flag1 = mathExtend.judgePointPos(p4, p1, p2);

        // //////////////////////////////
        // 左侧箭头
        let hAngle = 0;
        if (flag1 < 0) {
            hAngle = 10;
        } else {
            hAngle = -10;
        }
        let pt = mathExtend.pointRotate(p1, p4, hAngle);

        let x = p4[0] - pt[0];
        let y = p4[1] - pt[1];
        p5 = [p4[0] - x * 0.2, p4[1] - y * 0.2];
        // 求箭耳点
        y = p4[0] - p5[0];
        x = p4[1] - p5[1];
        // 左侧点
        p6 = [p5[0] - x * 0.322, p5[1] + y * 0.322];
        // 右侧点
        p7 = [p5[0] + x * 0.322, p5[1] - y * 0.322];

        // 求箭颈点
        p8 = [p5[0] + y * 0.248, p5[1] + x * 0.248];
        // 左侧点
        p9 = [p8[0] - x * 0.108, p8[1] + y * 0.108];
        // 右侧点
        p10 = [p8[0] + x * 0.108, p8[1] - y * 0.108];

        p12 = p9;
        p13 = p10;
        // 求外侧曲线控制点

        if (flag1 < 0) {
            hAngle = 18;
        } else {
            hAngle = -18;
        }
        pt = mathExtend.pointRotate(pt, p4, hAngle);

        p11 = [(pt[0] + p4[0]) * 0.5, (pt[1] + p4[1]) * 0.5];

        if (flag1 > 0) {
            let tempB = [];
            tempB.push([p10[0], p10[1]]);
            tempB.push([(p11[0] + p10[0]) * 0.5, (p11[1] + p10[1]) * 0.5]);
            tempB.push([(p1[0] + p11[0]) * 0.5, (p1[1] + p11[1]) * 0.5]);
            tempB.push([p1[0], p1[1]]);
            tempB = mathExtend.reversePoint(tempB);

            let resPts = mathExtend.calcBezierCurve(tempB, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }

            let tempL = [p10, p7, p4, p6, p9];

            for (let i = 0; i < 5; i++) {
                arrowPoints.push([tempL[i][0], tempL[i][1]]);
            }
        } else {
            let tempB = [];
            tempB.push([p1[0], p1[1]]);
            tempB.push([(p1[0] + p11[0]) * 0.5, (p1[1] + p11[1]) * 0.5]);
            tempB.push([(p11[0] + p9[0]) * 0.5, (p11[1] + p9[1]) * 0.5]);
            tempB.push([p9[0], p9[1]]);

            let resPts = mathExtend.calcBezierCurve(tempB, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }

            let tempL = [p9, p6, p4, p7, p10];
            for (let i = 0; i < 5; i++) {
                arrowPoints.push([tempL[i][0], tempL[i][1]]);
            }
        }

        pt = p2;

        if (flag2 < 0) {
            hAngle = -10;
        } else {
            hAngle = 10;
        }
        pt = mathExtend.pointRotate(pt, p3, hAngle);

        y = p3[0] - pt[0];
        x = p3[1] - pt[1];
        p5 = [p3[0] - y * 0.2, p3[1] - x * 0.2];
        // 求箭耳点
        y = p3[0] - p5[0];
        x = p3[1] - p5[1];
        // 左侧点
        p6 = [p5[0] - x * 0.322, p5[1] + y * 0.322];
        // 右侧点
        p7 = [p5[0] + x * 0.322, p5[1] - y * 0.322];

        // 求箭颈点
        p8 = [p5[0] + y * 0.248, p5[1] + x * 0.248];
        // 左侧点
        p9 = [p8[0] - x * 0.108, p8[1] + y * 0.108];
        // 右侧点
        p10 = [p8[0] + x * 0.108, p8[1] - y * 0.108];
        // 求外侧曲线控制点

        if (flag2 < 0) {
            hAngle = -18;
        } else {
            hAngle = 18;
        }
        pt = mathExtend.pointRotate(pt, p3, hAngle);
        p11 = [(pt[0] + p3[0]) * 0.5, (pt[1] + p3[1]) * 0.5];

        // 连接曲线
        let p14 = null,
            p15 = null;
        x = p2[0] - p1[0];
        y = p2[1] - p1[1];
        let p16 = [p1[0] - 0.05 * x, p1[1] - 0.05 * y];
        let p17 = [p2[0] + 0.05 * x, p2[1] + 0.05 * y];

        x = p4[0] - p16[0];
        y = p4[1] - p16[1];
        let p18 = [p16[0] - 0.32 * x, p16[1] - 0.32 * y];
        let p19 = [p4[0] + 0.32 * x, p4[1] + 0.32 * y];
        x = p19[0] - p18[0];
        y = p19[1] - p18[1];
        p14 = [p18[0] + 0.25 * x, p18[1] + 0.25 * y];

        x = p3[0] - p17[0];
        y = p3[1] - p17[1];
        p18 = [p17[0] - 0.32 * x, p17[1] - 0.32 * y];
        p19 = [p3[0] + 0.32 * x, p3[1] + 0.32 * y];

        x = p19[0] - p18[0];
        y = p19[1] - p18[1];
        p15 = [p18[0] + 0.25 * x, p18[1] + 0.25 * y];
        if (flag1 > 0 && flag2 > 0) {
            let q12 = [p12, p14, p15, p10];
            let resPts = mathExtend.calcBezierCurve(q12, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        } else if (flag1 < 0 && flag2 < 0) {
            let q1 = [p13, p14, p15, p9];
            let resPts = mathExtend.calcBezierCurve(q1, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        } else if (flag1 > 0 && flag2 < 0) {
            let q1 = [p12, p14, p15, p9];
            let resPts = mathExtend.calcBezierCurve(q1, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        } else if (flag1 < 0 && flag2 > 0) {
            let q1 = [p13, p14, p15, p10];
            let resPts = mathExtend.calcBezierCurve(q1, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        }

        let tempH = [p9, p6, p3, p7, p10];
        if (flag2 > 0) {
            tempH = mathExtend.reversePoint(tempH);
        }

        for (let i = 0; i < tempH.length; i++) {
            arrowPoints.push([tempH[i][0], tempH[i][1]]);
        }

        if (flag2 > 0) {
            let tempB = [];
            tempB.push([p2[0], p2[1]]);
            tempB.push([(p2[0] + p11[0]) * 0.5, (p2[1] + p11[1]) * 0.5]);
            tempB.push([(p11[0] + p9[0]) * 0.5, (p11[1] + p9[1]) * 0.5]);
            tempB.push([p9[0], p9[1]]);

            tempB = mathExtend.reversePoint(tempB);

            let resPts = mathExtend.calcBezierCurve(tempB, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        } else {
            let tempB = [];
            tempB.push([p10[0], p10[1]]);
            tempB.push([(p11[0] + p10[0]) * 0.5, (p11[1] + p10[1]) * 0.5]);
            tempB.push([(p2[0] + p11[0]) * 0.5, (p2[1] + p11[1]) * 0.5]);
            tempB.push([p2[0], p2[1]]);

            let resPts = mathExtend.calcBezierCurve(tempB, 100);
            for (let i = 0; i < resPts.length; i++) {
                arrowPoints.push([resPts[i][0], resPts[i][1]]);
            }
        }
        return arrowPoints;
    }

    static reversePoint(Rlist: number[][]) {
        let qlist = [];
        for (let i = Rlist.length - 1; i > -1; i--) {
            qlist.push(Rlist[i]);
        }
        return qlist;
    }

    static calcBezierCurve(pts: number[][], iSection: number) {
        let rets = [];

        let a0, a1, a2, a3, b0, b1, b2, b3;
        let cSize = pts.length;
        for (let i = 0; i < cSize - 3; i += 3) {
            a0 = pts[i][0];
            a1 = -3 * pts[i][0] + 3 * pts[i + 1][0];
            a2 = 3 * pts[i][0] - 6 * pts[i + 1][0] + 3 * pts[i + 2][0];
            a3 =
                -pts[i][0] +
                3 * pts[i + 1][0] -
                3 * pts[i + 2][0] +
                pts[i + 3][0];

            b0 = pts[i][1];
            b1 = -3 * pts[i][1] + 3 * pts[i + 1][1];
            b2 = 3 * pts[i][1] - 6 * pts[i + 1][1] + 3 * pts[i + 2][1];
            b3 =
                -pts[i][1] +
                3 * pts[i + 1][1] -
                3 * pts[i + 2][1] +
                pts[i + 3][1];

            // 一段贝塞尔曲线的分段数
            if (iSection <= 0) {
                iSection = 1;
            }

            let div = 1.0 / iSection;
            let t = 0;
            for (let k = 0; k < iSection + 1; k++, t += div) {
                let pt = [
                    a0 + a1 * t + a2 * t * t + a3 * t * t * t,
                    b0 + b1 * t + b2 * t * t + b3 * t * t * t,
                ];
                if (t > 1.0) {
                    continue; // 剔除两段贝塞尔曲线的首位重合点
                }
                rets.push(pt);
            }
        }
        return rets;
    }

    static getRotateAngle(
        ptAnchor: number[],
        ptOld: number[],
        ptNew: number[]
    ) {
        if (ptAnchor == ptOld || ptNew == ptAnchor || ptOld == ptNew) {
            return 0;
        }
        // 公式：cosA = (AB*AC)/(|AB|*|AC|)
        let xAB = ptOld[0] - ptAnchor[0];
        let yAB = ptOld[1] - ptAnchor[1];
        let xAC = ptNew[0] - ptAnchor[0];
        let yAC = ptNew[1] - ptAnchor[1];
        let dAB = Math.sqrt(xAB * xAB + yAB * yAB);
        let dAC = Math.sqrt(xAC * xAC + yAC * yAC);
        let A = Math.acos((xAB * xAC + yAB * yAC) / (dAB * dAC));
        return A;
    }

    static computeShapePoints(tGeoAttr2D: number[][]) {
        const mathExtend2 = require("./mathExtend2.js");
        // 获取箭身长度，输入控制点首尾不连总长度
        let ArrowBodyLen = mathExtend2.ComputeDistance(tGeoAttr2D);

        // 处理输入的控制点
        let OpectrlPoints = mathExtend2.OperateCtrlPts(tGeoAttr2D);

        if (OpectrlPoints.length == 2) {
            return OpectrlPoints;
        }
        let ctrlPointCount = OpectrlPoints.length - 1;

        // 生成箭身中轴线骨架点、左右两箭身骨架点、两箭身骨架点的左右控制点
        // 左右箭身骨架点
        let LeftBodyPtsTemp: number[][] = [];
        let RightBodyPtsTemp: number[][] = [];
        // 左箭身个拐点的左右控制点
        let LeftBodyPtsLeftCtrlPts: number[][] = [];
        let LeftBodyPtsRightCtrlPts: number[][] = [];
        // 右箭身个拐点的左右控制点
        let RightBodyPtsLeftCtrlPts: number[][] = [];
        let RightBodyPtsRightCtrlPts: number[][] = [];

        let ArrowTouLen = mathExtend2.GenArrowBodyPts(
            ArrowBodyLen,
            OpectrlPoints,
            LeftBodyPtsTemp,
            RightBodyPtsTemp,
            LeftBodyPtsLeftCtrlPts,
            LeftBodyPtsRightCtrlPts,
            RightBodyPtsLeftCtrlPts,
            RightBodyPtsRightCtrlPts
        );

        // 计算箭身曲线
        // ////////////////////////////////////////////////////////////////////////
        // 左箭身曲线
        let tLeftBodyPts = mathExtend2.GenArrBody(
            ctrlPointCount,
            LeftBodyPtsTemp,
            LeftBodyPtsLeftCtrlPts,
            LeftBodyPtsRightCtrlPts
        );

        // 右箭身曲线
        let tRightBodyPts = mathExtend2.GenArrBody(
            ctrlPointCount,
            RightBodyPtsTemp,
            RightBodyPtsLeftCtrlPts,
            RightBodyPtsRightCtrlPts
        ).reverse();

        // 计算箭头点数组
        let tArrowHeadPts = mathExtend2.GenAtPts(
            ctrlPointCount,
            OpectrlPoints,
            ArrowTouLen
        );
        // ////////////////////////////////////////////////////////////////////

        let arrowPoints2D: number[][] = [
            ...tLeftBodyPts,
            ...tArrowHeadPts,
            ...tRightBodyPts,
        ];
        return arrowPoints2D;
    }
}
