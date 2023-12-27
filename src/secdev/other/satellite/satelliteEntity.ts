import { Cartesian3, Entity, EntityCollection, PositionProperty, Viewer } from "cesium";
import satelliteProperties from "./satelliteProperties";
import { satProOptionType } from "./satelliteProperties";
import satelliteEntityWrapper from "./satelliteEntityWrapper";
import satelliteComponents from "./satelliteComponents";

export default class satelliteEntity {
    #viewer: Viewer;
    #collection: EntityCollection;
    #satEntities: satelliteEntityWrapper;
    props: satelliteProperties;
    constructor(viewer: Viewer, tle: string, collection: EntityCollection, options: Partial<satProOptionType>={}){
        this.#viewer = viewer;
        this.#collection = collection;

        this.props = new satelliteProperties(viewer, tle, options);

        this.#satEntities = new satelliteEntityWrapper(this.props);

        this.#createEntities();

    }

    /**
     * @description: 添加卫星组件
     * @param {string} satCom 参考satelliteComponents静态类
     * @return {*}
     */
    enableComponent(satCom: string){
        let entities = this.#satEntities.entities;
        if (satCom in entities) {
            let comStatus = entities[satCom];
            if (!comStatus.show) {
                this.#collection.add(comStatus.entity);
                comStatus.show = true;
            }
        }
    }

    /**
     * @description: 移除卫星组件
     * @param {string} satCom 参考satelliteComponents静态类
     * @return {*}
     */
    disableComponent(satCom: string) {
        let entities = this.#satEntities.entities;
        if (satCom in entities) {
            let comStatus = entities[satCom];
            if(comStatus.show){
                this.#collection.remove(comStatus.entity);
                comStatus.show = false;
            }
        }
    }

    destroy(){
        for (const key in this.#satEntities.entities) {
            const entityStatus = this.#satEntities.entities[key];
            if(entityStatus.show){
                this.#collection.remove(entityStatus.entity);
            }
        }
        this.props.destroy();
    }

    /**
     * @description: 创建卫星要素
     * @return {*}
     */
    #createEntities(){
        // clock 监听事件，控制卫星移动
        this.props.createSampledPosition();
        // 创建卫星组件
        this.#satEntities.createSatEntity();
    }
}