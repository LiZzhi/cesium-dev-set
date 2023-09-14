<template>
    <div class="comm-slider-box" :class="props.class">
        <input
            type="range"
            class="comm-input-slider"
            v-model.number="value"
            :step="props.step"
            :min="props.min"
            :max="props.max"
        />
        <div class="comm-slider-tip">
            <div class="comm-slider-triangle"></div>
            <span
                class="comm-slider-label"
            >{{ value }}</span>
        </div>
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

const ownValue:Ref<number> = ref(0);
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
            emits("update:modelValue", v);
        } else {
            ownValue.value = v;
        }
    },
})
</script>

<style lang="scss" scoped>
@import "./assets/style/CommSlider.scss"
</style>
