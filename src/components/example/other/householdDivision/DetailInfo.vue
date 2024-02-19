<template>
    <CommPanel title="详细信息" class="detail-info-box" @close="emits('close')">
        <el-scrollbar>
            <el-descriptions
                class="detail-table"
                border
                :column="1"
                v-if="props.data"
            >
                <el-descriptions-item
                    v-for="(item, i) in props.data"
                    :key="item.label"
                    :label="item.label"
                    label-class-name="detail-label"
                    >{{ item.value }}</el-descriptions-item
                >
            </el-descriptions>
        </el-scrollbar>
    </CommPanel>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        data?: Record<string, string>[];
    }>(),
    {
        data: undefined,
    }
);

const emits = defineEmits(["close"]);
</script>

<style lang="scss" scoped>
@import "./assets/style/DetailInfo.scss";
</style>
