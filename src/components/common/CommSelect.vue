<!--
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-09-13 14:53:45
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-09-13 18:42:08
 * @FilePath: \cesium-secdev-set\src\components\common\CommSelect.vue
 * @Description: 自定义公共组件(select)
 *	props属性:
 *		1.class { string } default:"" class名，用来修改样式
 *		2.optionClass { string } default:"" class名，用来修改选项框样式
 *		3.placeholder { string } default:"请选择" 提示
 *		4.data { selectOptionType[] } default:true 选项数据
 *		5.select { voidFuncType } 选择后触发
-->
<template>
    <div class="comm-select" v-close :class="[props.class, show?'comm-select-top':'']">
        <div class="comm-select-input-box" @click="showOption">
            <input
                readonly
                class="comm-select-input"
                type="text"
                :placeholder="props.placeholder"
            />
            <svg
                class="comm-select-icon"
                :class="show? 'comm-select-icon-trans' : ''"
                viewBox="0 0 1024 1024"
            >
                <path
                    d="M512.726547 675.318646c-8.063653 0-15.790638-3.245927-21.435195-9.006118L231.175103 400.906809c-11.603269-11.837606-11.410887-30.840402 0.427742-42.442648 11.837606-11.601222 30.841426-11.410887 42.442648 0.427742l238.681054 243.534596L751.407602 358.891903c11.601222-11.839653 30.602995-12.033058 42.442648-0.427742 11.839653 11.603269 12.031011 30.605042 0.427742 42.442648L534.161742 666.312528C528.517185 672.072719 520.791224 675.318646 512.726547 675.318646z"
                    p-id="2594"
                ></path>
            </svg>
        </div>
        <div class="comm-select-option-box" v-show="show" :class="props.optionClass">
            <ul class="comm-select-option">
                <li
                    class="comm-select-option-item"
                    v-for="(item, i) in data"
                    :key="i"
                    @click="chooseItem(item)"
                >{{ item.label }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Directive, DirectiveBinding } from "vue";
import { voidFuncType, selectOptionType } from "@/type/common";

const props = withDefaults(
    defineProps<{
        class?: string;
        optionClass?: string;
        placeholder?: string;
        data: selectOptionType[];
        select: voidFuncType;
    }>(),
    {
        class: "",
        optionClass: "",
        placeholder: "请选择",
    }
);

const show = ref(false);
const showOption = () => {
    show.value = !show.value;
};

const chooseItem = (item: selectOptionType) => {
    props.select && props.select(item);
    show.value = false;
}

let closeOptionEvent: voidFuncType;

const vClose:Directive = {
    // 点击别处关闭选项框
    mounted(el:HTMLElement, bindings: DirectiveBinding) {
        closeOptionEvent = (function(element: HTMLElement){
            return (ev: MouseEvent)=>{
                if (show.value && ev.target !== el && !el.contains(ev.target as Node)) {
                    show.value = false;
                }
            }
        }
        )(el);
        document.addEventListener("click", closeOptionEvent);
    },
    beforeUnmount(){
        document.removeEventListener("click", closeOptionEvent);
    }
};
</script>

<style lang="scss" scoped>
@import "./assets/style/CommSelect.scss";
</style>
