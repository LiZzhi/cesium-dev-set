<template>
    <button class="comm-button" :class="props.class">
        <span class="comm-button-context">
            <slot></slot>
        </span>
    </button>
</template>

<script setup lang='ts'>
const props = defineProps({
    class: {
        type: String,
        required: false,
        default: '',
    }
});
</script>

<style lang='scss' scoped>
@import "./assets/style/CommButton.scss"
</style>
