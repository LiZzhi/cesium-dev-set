<!--
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-05-24 11:39:23
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-02-04 14:46:16
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
        v-move="`panelTitle`"
        class="panelTem"
        :class="props.class"
    >
        <div class="panelTitle">
            <img v-if="icon" class="panelIcon" :src="props.icon" />
            <span v-if="title" class="panelLabel">{{ props.title }}</span>
            <img class="panelClose" :src="defaultClose" @click="emits('close')"/>
        </div>
        <div class="panelBody">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const defaultClose = require("./assets/img/commPanel/close.png");
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
</script>

<style lang="scss" scoped>
@import url(./assets/style/CommPanel.scss);
</style>
