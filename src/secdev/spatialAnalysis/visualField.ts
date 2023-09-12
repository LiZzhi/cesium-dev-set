import {
    Camera,
    PostProcessStage,
    ShadowMap,
    Primitive,
    Entity,
    Viewer,
} from "cesium";

export default class visualField {
    camera: Camera;
    postStage: PostProcessStage;
    shadowMap: ShadowMap;
    frustumOutline: Primitive;
    sketch: Entity;
    #viewer: Viewer;
    #isStart: boolean;
    constructor(
        viewer: Viewer,
        camera: Camera,
        postStage: PostProcessStage,
        shadowMap: ShadowMap,
        frustumOutline: Primitive,
        sketch: Entity,
    ) {
        this.#viewer = viewer;
        this.camera = camera;
        this.postStage = postStage;
        this.shadowMap = shadowMap;
        this.frustumOutline = frustumOutline;
        this.sketch = sketch;
        this.#isStart = false;
    }

    init() {
        if (!this.#isStart) {
            this.#viewer.scene.postProcessStages.add(this.postStage);
            // viewer.scene.primitives.add(this.frustumOutline);
            this.#viewer.entities.add(this.sketch);
            this.#isStart = true;
        }
    }

    remove() {
        if (this.#isStart) {
            this.#viewer.scene.postProcessStages.remove(this.postStage);
            // viewer.scene.primitives.remove(this.frustumOutline);
            this.#viewer.entities.remove(this.sketch);
            this.#isStart = false;
        }
    }
}
