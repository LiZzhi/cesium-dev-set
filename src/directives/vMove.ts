/*
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-30 09:34:17
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-30 09:42:02
 * @FilePath: \cesium-secdev-set\src\directives\vMove.ts
 * @Description: 拖拽
 */
import type { Directive, DirectiveBinding } from "vue";

const vMove:Directive = {
    mounted(el:HTMLElement, bindings: DirectiveBinding) {
        // 可传入指定拖拽元素的class，不指定则默认为绑定的元素
        let dragDom:HTMLElement;
        if (bindings.value) {
            dragDom = el.querySelector(`.${bindings.value}`) as HTMLElement;
        } else {
            dragDom = el;
        }

        dragDom.onmousedown = (e:MouseEvent) => {
            let offX = e.pageX - el.offsetLeft;
            let offY = e.pageY - el.offsetTop;
            document.onmousemove = (e:MouseEvent) => {
                el.style.left = e.pageX - offX + "px";
                el.style.top = e.pageY - offY + "px";
            };
            document.onmouseup = (e:MouseEvent) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    },
};

export default vMove;
