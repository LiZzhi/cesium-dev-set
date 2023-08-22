/*
 * @Author: “Lizhi” “362042734@qq.com”
 * @Date: 2023-08-13 20:44:49
 * @LastEditors: “Lizhi” “362042734@qq.com”
 * @LastEditTime: 2023-08-13 21:10:25
 * @FilePath: \cesium-secdev-set\src\utils\loadJsonFile.ts
 * @Description: 读取JSON文件
 */
export type errFuncType = (error: string) => void;
export type endParamsType = {
    fileName: string;   // 文件名
    filePath: string;   // 文件路径
    jsonContext: Object;    // 文件内容，JSON.parse
};
export type endFuncType = (endParams: endParamsType) => void;
export type loadParamsType = {
    errFunc: errFuncType;   // 错误回调,参数为错误字符串
    endFunc: endFuncType;   // 结束回调
};

/**
 * @description: 读取本地json
 * @param {loadParamsType} param
 * @return {*}
 */
export default function loadJsonFile({ errFunc, endFunc }: loadParamsType) {
    let $oldInput = document.getElementById("_ef");
    $oldInput && $oldInput.remove();

    let $input = document.createElement("input");
    $input.setAttribute("id", "_ef");
    $input.setAttribute("type", "file");
    $input.setAttribute("style", "display:none");
    document.body.appendChild($input);
    $input.onchange = function (d) {
        // @ts-ignore
        let file = $input.files[0];
        let fileName = file.name;
        let filePath = $input.value;
        let fileType = getFileType(fileName);
        if (!fileType) {
            typeof errFunc === "function" &&
                errFunc("文件类型无法失败，只支持Json格式！");
            return;
        }
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt: any) {
            try {
                let jsonContext = JSON.parse(evt.target.result);
                typeof endFunc === "function" &&
                    endFunc({ fileName, filePath, jsonContext });
            } catch (e) {
                typeof errFunc === "function" && errFunc("文件损坏！");
            }
        };
    };
    $input.click();
}

function getFileType(fileName: string) {
    const isJson = /.json$/i;
    fileName = fileName.toLowerCase();
    return isJson.test(fileName);
}
