/*
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-08-23 14:41:20
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-08-23 16:38:44
 * @FilePath: \cesium-secdev-set\src\secdev\utils\mouseMessageBox.ts
 * @Description: 在Cesium画布中创建跟着鼠标移动的消息盒子
 */
import { Viewer } from "cesium";

export default class mouseMessageBox {
    #viewer: Viewer;
    #dom: HTMLDivElement;
    #listener: any;
    #isCreate: boolean;
    constructor(viewer: Viewer) {
        this.#viewer = viewer;
        this.#dom = document.createElement("div");
        this.#isCreate = false;
    }

    create(message: string = "") {
        if(!this.#isCreate){
            this.#isCreate = true;
            this.#dom.innerHTML = message;
            this.setStyle();
            this.#createHandler();
            document.body.appendChild(this.#dom);
        }
    }

    destroy(){
        if(this.#isCreate){
            this.#isCreate = false;
            this.#viewer.scene.canvas.removeEventListener("mousemove", this.#listener);
            document.body.removeChild(this.#dom);
            this.#dom.innerHTML = "";
        }
    }

    changeMessage(message: string = ""){
        if(this.#isCreate){
            this.#dom.innerHTML = message;
        }
    }

    setStyle(className?: string) {
        if(this.#isCreate){
            this.#dom.style.position = "fixed";
            this.#dom.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            this.#dom.style.color = "white";
            this.#dom.style.borderRadius = "4px";
            this.#dom.style.opacity = "0.7";
            this.#dom.style.whiteSpace = "nowrap";
            this.#dom.style.padding = "5px";
            this.#dom.style.zIndex = "999";
            this.#dom.style.pointerEvents = "none";
            if (className) {
                this.#dom.classList.add(className);
            }
        }
    }

    #createHandler() {
        const scene = this.#viewer.scene;
        // canvas定位
        const canvasLocation = scene.canvas.getBoundingClientRect();
        this.#listener = this.#moveEvent(canvasLocation, this.#dom)
        // messageBox事件
        scene.canvas.addEventListener("mousemove", this.#listener);
    }

    #moveEvent(canvasLocation: DOMRect, dom: HTMLDivElement){
        return (e:MouseEvent) => {
            const left = e.clientX + 15;
            const top = e.clientY - 25;
            const right = left + dom.clientWidth;
            const bottom = top + dom.clientHeight;
            if (
                left >= canvasLocation.left &&
                top >= canvasLocation.top &&
                bottom <= canvasLocation.bottom &&
                right <= canvasLocation.right
            ) {
                dom.style.left = left + "px";
                dom.style.top = top + "px";
            }
        }
    }
}
