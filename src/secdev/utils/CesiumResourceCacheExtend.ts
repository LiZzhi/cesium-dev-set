/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2025-07-22 15:36:02
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2025-07-22 16:56:08
 * @FilePath: \cesium-dev-set\src\secdev\utils\CesiumResourceCacheExtend.ts
 * @Description: 针对Cesium中Resource类的indexDB缓存方法，该方法对Resource类进行了部分重写，
 *               重写后，Resource类会优先从indexDB中获取数据，如果获取不到，则从网络获取，
 *               并将其保存到indexDB中，以供下次使用。
 */

import localforage from "localforage";

let dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;

export default class CesiumResourceCacheExtend {
    private _rules: Set<string>;
    private _store: LocalForage;
    constructor() {
        this._rules = new Set();
        this._store = localforage.createInstance({ name: "CesiumResourceCache" });
    }

    /**
     * @description: 启用
     * @return {*}
     */
    init() {
        if (!window.indexedDB) {
            console.log(
                "当前浏览器不支持indexedDB，无法使用CesiumResourceCacheExtend缓存扩展，请更换浏览器尝试！",
                "color: red"
            );
        }
        // 开启缓存
        this.cacheProxy();
    }

    /**
     * @description: 设置缓存规则
     * @param {*} v 数组，例如[".glb", ".gltf", ".b3dm"]或["*"]
     * @return {*}
     */
    set rules(v) {
        this._rules = new Set(v);
    }

    /**
     * @description: 获取规则数组
     * @return {string[]}
     */
    get rules() {
        return [...this._rules];
    }

    /**
     * @description: 缓存方法
     * @return {*}
     */
    cacheProxy() {
        if (!window.Cesium) {
            console.log(
                "CesiumResourceCacheExtend缓存扩展未找到Cesium！",
                "color: red"
            );
            return;
        }

        // 检测indexDB容量
        // CesiumResourceCacheExtend.getDBSize().then();

        // 重写Resource类中内置的loadWithXhr方法
        this.reWriteLoadWithXhr();
    }

    /**
     * @description: 检测indexDB容量
     * @return {*}
     */
    // async getDBSize() {
    //     let quota = await navigator.storage.estimate();
    //     let percentageUsed = (quota.usage / quota.quota) * 100;
    //     let usageNum = quota.usage / 1024 / 1024;
    //     if (usageNum > 1024) {
    //         usageNum = usageNum / 1024 + " GB";
    //     } else {
    //         usageNum = usageNum.toFixed(2) + " MB";
    //     }
    //     let usageRatio = percentageUsed.toFixed(2);
    //     let remainingNum = (
    //         (quota.quota - quota.usage) /
    //         1024 /
    //         1024 /
    //         1024
    //     ).toFixed(2);
    //     console.log(
    //         `%c浏览器 IndexDB 已使用 ${usageNum}，占最大可用容量 ${usageRatio} % 。最多可以再写入 ${remainingNum} GB。`,
    //         "color:green"
    //     );
    //     return quota;
    // }

    /**
     * @description: 解码dataUri
     * @param { RegExpExecArray } dataUriRegexResult
     * @param { string } responseType
     * @return {*}
     */
    decodeDataUri(dataUriRegexResult: RegExpExecArray , responseType: string) {
        responseType = Cesium.defaultValue(responseType, "");
        const mimeType = dataUriRegexResult[1] as DOMParserSupportedType;
        const isBase64 = !!dataUriRegexResult[2];
        const data = dataUriRegexResult[3];
        let buffer;
        let parser;

        // 根据responseType类型解码dataUri
        switch (responseType) {
            case "":
            case "text":
                return decodeDataUriText(isBase64, data);
            case "arraybuffer":
                return decodeDataUriArrayBuffer(isBase64, data);
            case "blob":
                buffer = decodeDataUriArrayBuffer(isBase64, data);
                return new Blob([buffer], {
                    type: mimeType,
                });
            case "document":
                parser = new DOMParser();
                return parser.parseFromString(
                    decodeDataUriText(isBase64, data),
                    mimeType
                );
            case "json":
                return JSON.parse(decodeDataUriText(isBase64, data));
            default:
                throw new Cesium.DeveloperError(
                    `Unhandled responseType: ${responseType}`
                );
        }
    }

    /**
     * @description: 重写Resource类中内置的loadWithXhr方法
     * @return {*}
     */
    reWriteLoadWithXhr() {
        let that = this;
        // @ts-ignore
        Cesium.Resource._Implementations.loadWithXhr = function (
            url: any,
            responseType: any,
            method: any,
            data: any,
            headers: any,
            deferred: any,
            overrideMimeType: any
        ) {
            const dataUriRegexResult = dataUriRegex.exec(url);

            // ------ 构建Url的唯一标识 -------
            const reqKey = JSON.stringify({
                url,
                responseType,
                method,
                data,
                headers,
                deferred,
                overrideMimeType,
            });
            // -----------------------------

            if (dataUriRegexResult) {
                deferred.resolve(
                    that.decodeDataUri(dataUriRegexResult, responseType)
                );
                return;
            }

            const xhr = new XMLHttpRequest();

            // ------ 查询该 url 是否在缓存规则内 -------
            if (that.judgeUrl(url)) {
                // 优先从本地缓存中查找，若不存在再发送请求
                that.getItem(reqKey).then((c) =>
                    c ? deferred.resolve(c) : xhr.send(data)
                );
            }
            // -----------------------------------------------

            if (Cesium.TrustedServers.contains(url)) {
                xhr.withCredentials = true;
            }

            xhr.open(method, url, true);

            if (Cesium.defined(overrideMimeType) && Cesium.defined(xhr.overrideMimeType)) {
                xhr.overrideMimeType(overrideMimeType);
            }

            if (Cesium.defined(headers)) {
                for (const key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                }
            }

            if (Cesium.defined(responseType)) {
                xhr.responseType = responseType;
            }

            // While non-standard, file protocol always returns a status of 0 on success
            let localFile = false;
            if (typeof url === "string") {
                localFile =
                    url.indexOf("file://") === 0 ||
                    (typeof window !== "undefined" &&
                        window.location.origin === "file://");
            }

            xhr.onload = function () {
                if (
                    (xhr.status < 200 || xhr.status >= 300) &&
                    !(localFile && xhr.status === 0)
                ) {
                    deferred.reject(
                        new Cesium.RequestErrorEvent(
                            xhr.status,
                            xhr.response,
                            xhr.getAllResponseHeaders()
                        )
                    );
                    return;
                }

                const response = xhr.response;
                const browserResponseType = xhr.responseType;

                if (method === "HEAD" || method === "OPTIONS") {
                    const responseHeaderString = xhr.getAllResponseHeaders();
                    const splitHeaders = responseHeaderString
                        .trim()
                        .split(/[\r\n]+/);

                    const responseHeaders = {};
                    splitHeaders.forEach(function (line) {
                        const parts = line.split(": ");
                        const header = parts.shift();
                        // @ts-ignore
                        responseHeaders[header] = parts.join(": ");
                    });

                    deferred.resolve(responseHeaders);
                    return;
                }

                //All modern browsers will go into either the first or second if block or last else block.
                //Other code paths support older browsers that either do not support the supplied responseType
                //or do not support the xhr.response property.
                if (xhr.status === 204) {
                    // accept no content
                    deferred.resolve();
                } else if (
                    Cesium.defined(response) &&
                    (!Cesium.defined(responseType) ||
                        browserResponseType === responseType)
                ) {
                    // ------ 数据保存到本地缓存 ------------------------
                    // console.log(
                    //     "保存到本地缓存",
                    //     browserResponseType,
                    //     responseType,
                    //     response
                    // );
                    that.setItem(reqKey, response).then(
                        () => deferred.resolve(response)
                    );
                    // -----------------------------------------------
                } else if (
                    responseType === "json" &&
                    typeof response === "string"
                ) {
                    try {
                        // ------ 数据保存到本地缓存 ------------------------
                        let s = JSON.parse(response);
                        that.setItem(reqKey, s).then(() =>
                            deferred.resolve(s)
                        );
                        // -----------------------------------------------
                    } catch (e) {
                        deferred.reject(e);
                    }
                } else if (
                    (browserResponseType === "" ||
                        browserResponseType === "document") &&
                    Cesium.defined(xhr.responseXML) &&
                    xhr.responseXML!.hasChildNodes()
                ) {
                    // ------ 数据保存到本地缓存 ------------------------
                    that.setItem(
                        reqKey,
                        xhr.responseXML
                    ).then(() => deferred.resolve(xhr.responseXML));
                    // -----------------------------------------------
                } else if (
                    (browserResponseType === "" ||
                        browserResponseType === "text") &&
                    Cesium.defined(xhr.responseText)
                ) {
                    // ------ 数据保存到本地缓存 ------------------------
                    that.setItem(
                        reqKey,
                        xhr.responseText
                    ).then(() => deferred.resolve(xhr.responseText));
                    // -----------------------------------------------
                } else {
                    deferred.reject(
                        new Cesium.RuntimeError(
                            "Invalid XMLHttpRequest response type."
                        )
                    );
                }
            };

            xhr.onerror = function (e) {
                deferred.reject(new Cesium.RequestErrorEvent());
            };

            // 不符合缓存规则，按源码的原逻辑执行，照常发送请求
            if (!that.judgeUrl(url)) {
                xhr.send(data);
            }

            return xhr;
        };
    }

    /**
     * @description: 判断url是否在缓存规则内
     * @param {*} url
     * @return {*}
     */
    judgeUrl(url: string) {
        let cache = false;
        if (!cache) {
            for (let i = 0; i < this.rules.length; i++) {
                let r = this.rules[i];
                if (!cache) {
                    cache = url.includes(r) || r === "*"
                } else {
                    break;
                }
            }
        }
        return cache;
    }

    /**
     * @description: 获取缓存
     * @param {*} k
     */
    async getItem(k: string) {
        return await this._store.getItem(k);
    }

    /**
     * @description: 设置缓存
     * @param {*} k
     * @param {*} v
     */
    async setItem(k: string, v: any) {
        let urlObj = JSON.parse(k);
        if (this.judgeUrl(urlObj.url) && k && v) {
            return await this._store.setItem(k, v);
        } else {
            return false;
        }
    }

    async keys() {
        return await this._store.keys();
    }

    async clear() {
        await this._store.clear();
    }
}

/**
 * @description: Resource类内置方法
 * @param {*} isBase64
 * @param {*} data
 * @return {*}
 */
function decodeDataUriArrayBuffer(isBase64: boolean, data: any) {
    const byteString = decodeDataUriText(isBase64, data);
    const buffer = new ArrayBuffer(byteString.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
        view[i] = byteString.charCodeAt(i);
    }
    return buffer;
}

/**
 * @description: Resource类内置方法
 * @param {*} isBase64
 * @param {*} data
 * @return {*}
 */
function decodeDataUriText(isBase64: boolean, data: any) {
    const result = decodeURIComponent(data);
    if (isBase64) {
        return atob(result);
    }
    return result;
}
