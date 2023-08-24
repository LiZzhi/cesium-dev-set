<template>
    <div class="comm-input-box" :class="props.class">
        <input
            v-model="value"
            :placeholder="props.placeholder"
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
            const value = props.number ? Number(v) : v;
            emits("update:modelValue", value);
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
