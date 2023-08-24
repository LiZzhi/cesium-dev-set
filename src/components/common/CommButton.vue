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
