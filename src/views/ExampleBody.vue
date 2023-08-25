<template>
    <div class="example-body">
        <BaseEarth></BaseEarth>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import BaseEarth from "@/components/earth/BaseEarth.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/style/ExampleBody";
</style>
