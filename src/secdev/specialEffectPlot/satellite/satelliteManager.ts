import { CustomDataSource, EntityCollection, Viewer } from "cesium";
import satelliteEntity from "./satelliteEntity";
import satelliteComponents from "./satelliteComponents";

export default class satelliteManager {
    #viewer: Viewer;
    #satellites: satelliteEntity[];
    #satelliteDataSource: CustomDataSource;
    #entities: EntityCollection;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        this.#satellites = [];

        this.#satelliteDataSource = new Cesium.CustomDataSource('SatelliteDataSource');
        this.#viewer.dataSources.add(this.#satelliteDataSource);
        this.#entities = this.#satelliteDataSource.entities;
    }

    /**
     * @description: 从tle数据添加卫星轨道
     * @param {string} tle tle数据
     * @return {*}
     */
    addFromTle(tle: string) {
        const sat = new satelliteEntity(this.#viewer, tle, this.#entities);
        this.add(sat);
        return sat;
    }

    /**
     * @description: 添加卫星
     * @param {satelliteEntity} satelliteEntity
     * @return {*}
     */
    add(satelliteEntity: satelliteEntity) {
        if (this.satelliteNames.includes(satelliteEntity.props.name)) {
            console.log(`Satellite ${satelliteEntity.props.name} already exists`);
            return;
        }

        this.#satellites.push(satelliteEntity);
    }

    remove(satelliteEntity: satelliteEntity){
        let index = this.#satellites.findIndex(s => s.props.name === satelliteEntity.props.name);
        if (index !== -1) {
            satelliteEntity.destroy();
            this.#satellites.splice(index, 1);
        }
    }

    removeAll(){
        this.#satellites.forEach(s => {
            s.destroy();
        })
        this.#satellites.length = 0;
    }

    getSatByName(name: string){
        return this.#satellites.find(s => s.props.name === name);
    }

    /**
     * @description: 获取所有卫星名称
     * @return {string[]} 卫星名称
     */
    get satelliteNames() {
        return this.#satellites.map(sat => sat.props.name);
    }
}