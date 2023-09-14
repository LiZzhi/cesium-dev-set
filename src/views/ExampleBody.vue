<template>
    <div class="example-body">
        <BaseEarth></BaseEarth>
        <PositionBox></PositionBox>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import BaseEarth from "@/components/earth/BaseEarth.vue";
import PositionBox from "@/components/earth/PositionBox.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/style/ExampleBody";
</style>
