<template>
    <div class="comm-slider-warpper" :class="props.class">
        <el-slider
            v-model="value"
            :min="props.min"
            :max="props.max"
            :step="props.step"
        ></el-slider>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref } from "vue";

const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(
    defineProps<{
        min: number;
        max: number;
        class?: string;
        modelValue?: number;
        step?: number;
    }>(),
    {
        class: "",
        step: 1,
    }
);

const ownValue: Ref<number> = ref(0);
const value = computed({
    get: () => {
        if (props.modelValue !== undefined) {
            return props.modelValue;
        } else {
            return ownValue.value;
        }
    },
    set: (v) => {
        if (props.modelValue !== undefined) {
            emits("update:modelValue", v);
        } else {
            ownValue.value = v;
        }
    },
});
</script>

<style lang="scss" scoped>
@import "./assets/style/CommSlider.scss";
</style>
