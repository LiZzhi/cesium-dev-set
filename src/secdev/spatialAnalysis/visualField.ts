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
    constructor(
        camera: Camera,
        postStage: PostProcessStage,
        shadowMap: ShadowMap,
        frustumOutline: Primitive,
        sketch: Entity
    ) {
        this.camera = camera;
        this.postStage = postStage;
        this.shadowMap = shadowMap;
        this.frustumOutline = frustumOutline;
        this.sketch = sketch;
    }

    init(viewer: Viewer) {
        viewer.scene.postProcessStages.add(this.postStage);
        // viewer.scene.primitives.add(this.frustumOutline);
        viewer.entities.add(this.sketch);
    }

    remove(viewer: Viewer) {
        viewer.scene.postProcessStages.remove(this.postStage);
        // viewer.scene.primitives.remove(this.frustumOutline);
        viewer.entities.remove(this.sketch);
    }
}
