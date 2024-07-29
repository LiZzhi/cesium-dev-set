class satComponets {
    /**
     * 卫星点
     *
     */
    static get Point() {
        return 'Point';
    }
    /**
     * 卫星图标
     *
     */
    static get SatImage() {
        return 'satBillboard';
    }
    /**
     * 卫星名称标注
     *
     */
    static get Label() {
        return 'Label';
    }

    /**
     * 卫星三维模型
     *
     */
    static get Model() {
        return '3D model';
    }

    /**
     * 卫星轨道
     *
     */
    static get Orbit() {
        return 'Orbit';
    }

    /**
     * 地面扫面线
     *
     */
    static get GroundTrack() {
        return 'Ground track';
    }

    /**
     * 卫星圆锥形波束
     *
     */
    static get SensorCone() {
        return 'Sensor cone';
    }

    /**
     * 卫星方锥形波束
     *
     */
    static get SensorSquareCone() {
        return 'Sensor square cone';
    }
}

export default satComponets;
