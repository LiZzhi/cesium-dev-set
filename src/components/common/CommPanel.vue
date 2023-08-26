<!--
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-05-24 11:39:23
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-24 10:08:41
 * @FilePath: \cesium-secdev-set\src\components\common\CommPanel.vue
 * @Description: 自定义公共组件
 *	props属性:
 *		1.class { string } default:"" 最外层class
 *		2.title { String } default:"标题" 标题，若不想有标题请设置空字符串
 *		3.icon { String } default:"icon2.png" 图标，若不想有图标请设置空字符串
 *  触发事件
 *		4.close 参数:无 组件销毁时触发
-->
<template>
    <div
        v-if="alive"
        v-move="`panelTitle`"
        class="panelTem"
        :class="props.class"
    >
        <div class="panelTitle">
            <img v-if="icon" class="panelIcon" :src="props.icon" />
            <span v-if="title" class="panelLabel">{{ props.title }}</span>
            <img class="panelClose" :src="defaultClose" @click="alive=false;"/>
        </div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import type { Directive, DirectiveBinding } from "vue";

const defaultClose = require("./assets/img/commPanel/close.png");
const alive = ref(true);
const emits = defineEmits(["close"]);
const props = withDefaults(
    defineProps<{
        class?: string;
        title?: string;
        icon?: string;

    }>(),
    {
        class: "",
        title: "标题",
        icon: require("./assets/img/commPanel/icon2.png"),
    }
);

// 拖拽
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

onBeforeUnmount(() => {
    emits("close");
});
</script>

<style lang="scss" scoped>
@import url(./assets/style/CommPanel.scss);
</style>
