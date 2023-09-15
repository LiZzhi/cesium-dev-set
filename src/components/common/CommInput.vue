<!--
 * @Author: XingTao 362042734@qq.com
 * @Date: 2023-08-24 09:10:29
 * @LastEditors: XingTao 362042734@qq.com
 * @LastEditTime: 2023-08-24 10:01:13
 * @FilePath: \cesium-secdev-set\src\components\common\CommInput.vue
 * @Description: 自定义公共组件(输入框)
 *	props属性:
 *		1.class { string } default:"" class名，用来修改样式
 *		2.placeholder { string } default:"" 提示
 *		3.modelValue { string|number } default:"" v-model绑定用
 *		4.clearable { boolean } default:false 是否需要清空按钮
 *		5.number { boolean } default:false 是否为数字类型
-->
<template>
    <div class="comm-input-box" :class="props.class">
        <input
            v-model="value"
            :placeholder="props.placeholder"
            :type="props.number? 'number' : 'text'"
            class="comm-input"
        />
        <span
            v-if="props.clearable"
            class="comm-input-clear"
            @click="clearInput"
        ></span>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref } from "vue";

const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(
    defineProps<{
        class?: string;
        placeholder?: string;
        modelValue?: string|number;
        clearable?: boolean;
        number?: boolean;
    }>(),
    {
        class: "",
        placeholder: "",
        clearable: false,
        number: false,
    }
);

const ownValue:Ref<string|number> = ref("");
const value = computed({
    get: () => {
        if(props.modelValue !== undefined){
            return props.modelValue;
        } else {
            return ownValue.value;
        }
    },
    set: (v) => {
        if(props.modelValue !== undefined){
            // const value = props.number ? Number(v) : v;
            emits("update:modelValue", v);
        } else {
            ownValue.value = v;
        }
    },
})

const clearInput = () => {
    const clear = props.number? 0 : "";
    value.value = clear;
};
</script>

<style lang="scss" scoped>
@import "./assets/style/CommInput.scss";
</style>
