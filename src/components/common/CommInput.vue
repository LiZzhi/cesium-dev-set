<template>
    <div ref="$comm-input-box" class="comm-input-box" :class="props.class">
        <input
            v-model="value"
            :placeholder="props.placeholder"
            type="text"
            class="comm-input"
            @focus="onFocus"
            @blur="onBlue"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";

const currentInstance = getCurrentInstance();
const props = defineProps({
    class: {
        type: String,
        required: false,
        default: "",
    },
    placeholder: {
        type: String,
        required: false,
        default: "",
    },
    value: {
        required: false,
    },
});

const value = props.value || ref("");

const focus = ref(false);
const onFocus = () => {
    // currentInstance!.refs["$comm-input-box"].classList.add("comm-input-focus");
    focus.value = true;
};
const onBlue = () => {
    // currentInstance!.refs["$comm-input-box"].classList.remove("comm-input-focus");
    focus.value = true;
};
</script>

<style lang="scss" scoped>
@import "./assets/style/CommInput.scss";
</style>
