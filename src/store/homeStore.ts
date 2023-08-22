import { defineStore } from "pinia";
import menu from "@/config/menuConfig";
import type { menuConfigType } from "@/type/config";

const useHomeStore = defineStore("home", {
    state: ()=>{
        return{
            checkMenu: menu[0],
        }
    },
    actions: {}
})

export default useHomeStore;