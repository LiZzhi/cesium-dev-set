<!--
 * @Author: XingTao xingt@geovis.com.cn
 * @Date: 2023-08-23 13:43:50
 * @LastEditors: XingTao xingt@geovis.com.cn
 * @LastEditTime: 2023-08-24 09:29:33
 * @FilePath: \cesium-secdev-set\src\components\common\CommButton.vue
 * @Description: 自定义公共组件(按钮)
 *	props属性:
 *		1.class { string } default:"" class名，用来修改样式
-->
<template>
    <button class="comm-button" :class="props.class">
        <span class="comm-button-context">
            <slot></slot>
        </span>
    </button>
</template>

<script setup lang='ts'>
const props = withDefaults(
    defineProps<{
        class?: string;
    }>(),
    {
        class: "",
    }
);
</script>

<style lang='scss' scoped>
@import "./assets/style/CommButton.scss"
</style>
