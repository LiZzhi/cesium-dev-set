import { Viewer, SkyBox } from "cesium"
import groundSkyBox from "./groundSkyBox";

export type skyOptionType = {
    show? : boolean,
    sources: {
        positiveX : string,
        negativeX : string,
        positiveY : string,
        negativeY : string,
        positiveZ : string,
        negativeZ : string,
    }
}

export default class panoramicSkyBox{
    #viewer: Viewer;
    #farSkyBox: SkyBox;
    #nearSkyBox: groundSkyBox;
    constructor(viewer: Viewer, farOptions: skyOptionType, nearOptions: skyOptionType){
        this.#viewer = viewer;
        this.#farSkyBox = new Cesium.SkyBox(farOptions);
        this.#nearSkyBox = new groundSkyBox(nearOptions);
    }

    init(){
        this.destroy();
        this.#viewer.scene.postRender.addEventListener(this.#change, this);
    }

    destroy(){
        this.#viewer.scene.postRender.removeEventListener(this.#change, this)
        this.#viewer.scene.skyAtmosphere.show = true;
    }

    set farOptions(farOptions: skyOptionType){
        this.#farSkyBox = new Cesium.SkyBox(farOptions);
    }

    set nearOptions(nearOptions: skyOptionType){
        this.#nearSkyBox = new groundSkyBox(nearOptions);
    }

    #change(){
        let p = this.#viewer.camera.position;
        if (Cesium.Cartographic.fromCartesian(p).height < 10000) {
            // @ts-ignore
            this.#viewer.scene.skyBox = this.#nearSkyBox;
            this.#viewer.scene.skyAtmosphere.show = false;
        } else {
            this.#viewer.scene.skyBox = this.#farSkyBox;
            this.#viewer.scene.skyAtmosphere.show = true;
        }
    }
}