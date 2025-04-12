import { Viewer } from "cesium";

export type globalFuncType = typeof globalFunc

let globalFunc = {
    setChinaView: (viewer: Viewer) => {
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                101.11760950808875,
                39.00441706685786,
                8039618.4428313
            ),
        });
    },
};

window.globalFunc = globalFunc;
