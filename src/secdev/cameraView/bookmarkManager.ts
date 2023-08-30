import { Viewer, Cartesian3, HeadingPitchRoll } from "cesium";
import saveShareContent from "@/utils/saveShareContent";
import loadJsonFile from "@/utils/loadJsonFile";
import uuid from "@/utils/uuid";

export type CameraViewType = {
    destination: Cartesian3;    // 位置
    orientation: HeadingPitchRoll;  // 方向
};

export type BookmarkType = {
    id: string;
    img: string;
    name: string;
    cameraView: CameraViewType;
    description?: any;
};


export default class bookmarkManager {
    #viewer: Viewer;
    /**
     * @description: 相机书签管理功能
     * @param {Viewer} viewer viewer
     */
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
    }

    /**
     * 创建书签
     * @param {string} name 书签名称
     * @param {number} height 场景截图canvas高度
     * @param {number} width 场景截图canvas宽度
     * @returns {BookmarkType} 返回一个新的相机书签
     */
    createBookmark(
        name: string,
        height: number,
        width: number
    ): Promise<BookmarkType> {
        let scene = this.#viewer.scene;
        return new Promise((resolve, reject) => {
            this.#getSceneImage(height, width).then((res) => {
                resolve({
                    id: uuid(),
                    img: res,
                    name: name,
                    cameraView: {
                        destination: new Cesium.Cartesian3(
                            scene.camera.position.x,
                            scene.camera.position.y,
                            scene.camera.position.z
                        ),
                        orientation: new Cesium.HeadingPitchRoll(
                            scene.camera.heading,
                            scene.camera.pitch,
                            scene.camera.roll
                        ),
                    },
                });
            });
        });
    }

    /**
     * 存储json格式的视角书签
     * @param {string} filsName 保存的文件名
     * @param {BookmarkType[]} markList (可选)要保存的书签列表，默认全部保存
     * @returns {MarkJsonType} 待存储的书签json
     */
    saveMark(filsName: string, markList: BookmarkType[]) {
        saveShareContent(JSON.stringify(markList), `${filsName}.json`);
    }

    /**
     * 读取MarkJsonType格式加入书签列表中
     * @param {CallBackType} callback (可选)第一个参数为MarkJsonType类型的书签, 第二个参数为该书签在读取列表中的存储索引
     * @returns {*}
     */
    loadMark(callback: any){
        loadJsonFile({
            errFunc: (msg: string) => {
                console.log(msg);
            },
            endFunc: ({jsonContext}) => {
                typeof callback === "function" && callback(jsonContext);
            },
        });
    }

    /**
     * 创建书签时当前场景截图
     * @param {number} height canvas高度
     * @param {number} width canvas宽度
     * @returns
     */
    #getSceneImage(height: number, width: number): Promise<string> {
        let canvas = this.#viewer.scene.canvas;
        let image = new Image();
        image.src = canvas.toDataURL("image/png");

        return new Promise((resolve, reject) => {
            image.onload = function () {
                canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas
                    .getContext("2d")!
                    .drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg"));
            };
        });
    }
}
