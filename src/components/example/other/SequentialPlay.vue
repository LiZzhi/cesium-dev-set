<template>
    <div v-show="spread" class="sequential-play-box right-slip-into">
        <div class="sequential-play-top">
            <span class="top-title"> 时间轴</span>
            <span @click="spread = false" class="top-spread">
                <el-icon color="rgba(255,255,255,0.8)"><ArrowUp /></el-icon>
                <span class="top-spread-label">收起</span>
            </span>
            <span @click="" class="top-close">
                <el-icon color="rgba(255,255,255,0.8)"><Close /></el-icon>
            </span>
        </div>
        <div class="sequential-play-bottom">
            <img
                @click="changeTime(Number.NEGATIVE_INFINITY)"
                class="quick-back"
                src="./assets/img/quickBack.png"
            />
            <div class="time-line" ref="$timeLine">
                <div
                    class="line-item"
                    :style="{
                        width: nodeWidth * (showList.length - 1) + 'px',
                    }"
                ></div>
                <div
                    class="line-item line-active"
                    :style="{
                        width: nodeWidth * (position - 1) + 'px',
                    }"
                ></div>
                <div
                    v-for="(item, i) in showList"
                    :key="i"
                    class="node-item"
                    :style="{
                        width:
                            i !== showList.length - 1
                                ? nodeWidth + 'px'
                                : '40px',
                    }"
                >
                    <img
                        class="time-node-icon"
                        v-if="position === i + 1"
                        src="./assets/img/timeNode-active.png"
                    />
                    <div class="time-node-tick"></div>
                    <div
                        class="time-node-label"
                        :class="position === i + 1 ? 'label-active' : ''"
                        @click="chooseTime(item)"
                    >
                        {{ item }}
                    </div>
                </div>
            </div>
            <img
                @click="changeTime(Number.POSITIVE_INFINITY)"
                class="quick-forward"
                src="./assets/img/quickForward.png"
            />
            <div class="time-line-controls">
                <el-icon @click="changeTime(step * -1)"><ArrowLeft /></el-icon>
                <el-icon v-if="status" @click="play"><VideoPause /></el-icon>
                <el-icon v-else @click="play"><VideoPlay /></el-icon>
                <el-icon @click="changeTime(step)"><ArrowRight /></el-icon>
            </div>
        </div>
    </div>
    <div v-show="!spread" class="sequential-play-small-box">
        <span class="small-box-label">{{ nowTime }}</span>
        <span class="small-controls-box">
            <el-icon @click="changeTime(step * -1)"><ArrowLeft /></el-icon>
            <el-icon v-if="status" @click="play"><VideoPause /></el-icon>
            <el-icon v-else @click="play"><VideoPlay /></el-icon>
            <el-icon @click="changeTime(step)"><ArrowRight /></el-icon>
        </span>
        <span @click="spread = true" class="small-spread">
            <el-icon color="rgba(255,255,255,0.8)"><ArrowDown /></el-icon>
            <span class="small-spread-label">展开</span>
        </span>
        <span @click="" class="small-close">
            <el-icon color="rgba(255,255,255,0.8)"><Close /></el-icon>
        </span>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    ref,
    watch,
    onMounted,
    onBeforeUnmount,
    nextTick,
    Ref,
} from "vue";
import {
    ArrowDown,
    ArrowUp,
    Close,
    ArrowLeft,
    VideoPause,
    VideoPlay,
    ArrowRight,
} from "@element-plus/icons-vue";
import { ImageryLayer, Rectangle } from "cesium";

type dataType = {
    time: string;
    options: {
        url: string;
        rectangle: Rectangle;
    };
};

let interval: number | undefined; // 自动播放
let layer: ImageryLayer | undefined; // 当前加载图层
const maxNode = ref(5);
const step = ref(1);
const timeList: Ref<string[]> = ref([]); // 所有时间节点
const spread = ref(true);
const nodeShow = ref(true); // 异常情况取消节点显示
const status = ref(false); // 是否开启自动播放
const nowTime: Ref<string> = ref(""); // 当前节点时间
const position = ref(1); // 当前高亮位置
const showList: Ref<string[]> = ref([]); // 当前显示时间数组
const $timeLine = ref();
const nodeWidth = ref(0);
const rect = Cesium.Rectangle.fromDegrees(
    (119.544881304),
    45.443376722,
    119.644060142,
    45.560072248
);
const imageryList: Ref<dataType[]> = ref([
    {
        time: "2019",
        options: {
            url: require("./assets/img/sequential/chong2019.png"),
            rectangle: rect,
        },
    },
    {
        time: "2020",
        options: {
            url: require("./assets/img/sequential/chong2020.png"),
            rectangle: rect,
        },
    },
    {
        time: "2021",
        options: {
            url: require("./assets/img/sequential/chong2021.png"),
            rectangle: rect,
        },
    },
]);

/**
 * @description: 前后箭头时间节点变动
 * @param {*} add
 * @return {*}
 */
function changeTime(add: number) {
    if (!nowTime.value || nodeCount.value === 0) {
        showList.value = [];
        nodeShow.value = false;
        return;
    }
    // 查索引
    let index = timeList.value.findIndex((v) => v === nowTime.value);
    if (index === -1) {
        showList.value = [];
        nodeShow.value = false;
        return;
    }
    let length = timeList.value.length;
    // 向前或后进位
    if (add < 0) {
        if (position.value + add >= 1) {
            // 判断是否需要变动展示数组
            position.value += add;
        } else {
            let showStart = index + add < 0 ? 0 : index + add; // 计算时间线起始
            showList.value = timeList.value.slice(
                showStart,
                showStart + nodeCount.value
            );
            let posiStart = position.value + add < 1 ? 1 : position.value + add; // 计算当前节点
            position.value = posiStart;
        }
    } else if (add === 0) {
        return;
    } else {
        if (position.value + add <= nodeCount.value) {
            // 判断是否需要变动展示数组
            position.value += add;
        } else {
            let showEnd = index + add >= length ? length : index + add + 1; // 计算时间线终止
            showList.value = timeList.value.slice(
                showEnd - nodeCount.value,
                showEnd
            );
            let posiEnd =
                position.value + add > nodeCount.value
                    ? nodeCount.value
                    : position.value + add; // 计算当前节点
            position.value = posiEnd;
        }
    }
    nodeShow.value = true;
    nowTime.value = showList.value[position.value - 1];
}

/**
 * @description: 点击节点触发
 * @param {*} time
 * @return {*}
 */
function chooseTime(time: string) {
    let index = showList.value.findIndex((v) => v === time);
    position.value = index + 1;
    nowTime.value = time;
}

/**
 * @description: 自动播放
 * @return {*}
 */
function play() {
    if (interval) {
        clearInterval(interval);
        interval = undefined;
        status.value = false;
    } else {
        status.value = true;
        let length = timeList.value.length;
        interval = setInterval(() => {
            let index = timeList.value.findIndex((v) => v === nowTime.value);
            if (index === length - 1) {
                nowTime.value = timeList.value[0]; // 当前节点时间
                position.value = 1; // 当前高亮位置
                showList.value = timeList.value.slice(0, nodeCount.value); // 当前显示时间数组
            } else {
                changeTime(step.value);
            }
        }, 3000);
    }
}

function remove() {
    if (layer) {
        viewer.imageryLayers.remove(layer);
        layer = undefined;
    }
}

function change(time: string) {
    remove();
    let item = imageryList.value.find((v) => v.time === time);
    if (item) {
        let options = item.options;
        layer = viewer.imageryLayers.addImageryProvider(
            new Cesium.SingleTileImageryProvider(options)
        );
    }
}

function computedNodeWidth() {
    if ($timeLine.value) {
        let w = $timeLine.value.querySelector(".time-node-label");
        if (w) {
            let width =
                ($timeLine.value.scrollWidth - w.scrollWidth) /
                (showList.value.length - 1);
            nodeWidth.value = width;
        } else {
            nodeWidth.value = 0;
        }
    } else {
        nodeWidth.value = 0;
    }
}

// 计算时间节点数量
const nodeCount = computed(() => {
    let len = timeList.value.length;
    if (len < maxNode.value) {
        return len;
    } else {
        return maxNode.value;
    }
});

watch(nowTime, (v) => {
    // 监听当前time变化,触发change事件
    change(v);
});

onMounted(() => {
    imageryList.value.forEach((v) => {
        timeList.value.push(v.time);
    });
    showList.value = timeList.value.slice(0, nodeCount.value);
    viewer.camera.flyTo({
        destination: rect,
        duration: 2.0,
    });
    nextTick(() => {
        if (showList.value.length) {
            nowTime.value = showList.value[0];
        }
        computedNodeWidth();
    });
});

onBeforeUnmount(() => {
    clearInterval(interval); // 清除自动播放
    interval = undefined;
    remove();
});
</script>

<style lang="scss" scoped>
@import "./assets/style/SequentialPlay.scss";
</style>
