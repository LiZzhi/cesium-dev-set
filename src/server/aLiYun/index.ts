import axios from "axios";

const server = axios.create({
    baseURL: window.$config.ip.aLiYun,
});

export default server;