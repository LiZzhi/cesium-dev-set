<template>
    <CommPanel title="视角书签" class="bookmark-panel-box">
        <div class="bookmark-panel">
            <div class="bookmark-head">
                <CommInput v-model="name" placeholder="请输入视角名称" class="bookmarke-name"></CommInput>
                <CommButton @click="addMark" class="bookmark-btn" contentClass="add">添加</CommButton>
                <CommButton @click="loadMarkList" class="bookmark-btn">导入</CommButton>
                <CommButton @click="exportMarkList" class="bookmark-btn">导出</CommButton>
            </div>
            <div class="bookmark-body">
                <div
                    v-for="(item, i) in markList"
                    :key="item.id"
                    class="mark-item"
                >
                    <div class="mark-title-box">
                        <span class="mark-title">名称:{{ item.name }}</span>
                        <CommButton @click="removeMark(item.id)" contentClass="bookmark-del">移除</CommButton>
                    </div>
                    <img @click="fly(item)" :src="item.img" class="mark-img"/>
                </div>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import bookmarkManager from "@/secdev/cameraView/bookmarkManager";
import type { BookmarkType } from "@/secdev/cameraView/bookmarkManager";

let bookmark: bookmarkManager;
const name = ref("");
const width = ref(0);
const height = ref(0);
const markList: Ref<BookmarkType[]> = ref([]);
onMounted(() => {
    bookmark = new bookmarkManager(viewer);

    const markBody = document.querySelector(".bookmark-body") as HTMLDivElement;
    width.value = markBody.clientWidth;
    const ratio = viewer.canvas.clientHeight / viewer.canvas.clientWidth;
    height.value = Math.floor(width.value * ratio);
    viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        })
    )
    const startMark:BookmarkType[] = require("../cameraView/assets/json/startMark.json")
    markList.value.push(startMark[0])
});

const addMark = async () => {
    const mark = await bookmark.createBookmark(
        name.value,
        height.value,
        width.value
    );
    markList.value.push(mark);
};

const removeMark = (id: string) => {
    const index = markList.value.findIndex(v => v.id === id);
    markList.value.splice(index, 1)
}

const loadMarkList = () => {
    bookmark.loadMark((json: BookmarkType[])=>{
        json.forEach(v => {
            let has = markList.value.findIndex(m => m.id === v.id);
            if(has === -1){
                markList.value.push(v)
            }
        })
    });
}

const exportMarkList = () => {
    bookmark.saveMark("导出书签", markList.value);
}

const fly = (item: BookmarkType) => {
    viewer.camera.flyTo(item.cameraView)
}
</script>

<style lang="scss" scoped>
@import "./assets/style/BookmarkManager.scss";
</style>
