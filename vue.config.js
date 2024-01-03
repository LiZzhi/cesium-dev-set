const path = require("path");
const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// 重新编译自动清空build文件夹
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
// cesium配置
const cesiumSource = "./node_modules/cesium/Build/Cesium";

module.exports = defineConfig({
    publicPath: './',
    transpileDependencies: true,
    // 取消eslint，太特么痛苦了，再也不折磨自己了
    lintOnSave: false,
    // webpack配置
    configureWebpack: {
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(cesiumSource, "Workers"),
                        to: "Workers",
                    },
                    {
                        from: path.resolve(cesiumSource, "Assets"),
                        to: "Assets",
                    },
                    {
                        from: path.resolve(cesiumSource, "Widgets"),
                        to: "Widgets",
                    },
                    {
                        from: path.resolve(cesiumSource, "ThirdParty/Workers"),
                        to: "ThirdParty/Workers",
                    },
                ],
            }),
            new webpack.DefinePlugin({
                CESIUM_BASE_URL: JSON.stringify("./"),
            }),
            new NodePolyfillPlugin(),
        ],
        resolve: {
            alias: {
                // 设置别名
                "~": path.resolve(__dirname, "./"),
                "@": path.resolve(__dirname, "./src"),
            },
            // 设置引用模块
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
        },
        module: {
            rules: [
                {
                    test: /\.(gltf|glb)(\?.*)?$/,
                    loader: "url-loader",
                    include: /src/,
                    options: {
                        limit: 10000,
                        name: "static/model/[name].[hash:7].[ext]",
                        esModule: false,
                    },
                    type: "javascript/auto"
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: "url-loader",
                    include: /src/,
                    options: {
                        limit: 10000,
                        name: "static/img/[name].[hash:7].[ext]",
                        esModule: false,
                    },
                    type: "javascript/auto"
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: "url-loader",
                    include: /src/,
                    options: {
                        limit: 10000,
                        name: "static/media/[name].[hash:7].[ext]",
                        esModule: false,
                    },
                    type: "javascript/auto"
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: "url-loader",
                    include: /src/,
                    options: {
                        limit: 10000,
                        name: "static/fonts/[name].[hash:7].[ext]",
                        esModule: false,
                    },
                    type: "javascript/auto"
                },
                {
                    test: /\.(txt)(\?.*)?$/,
                    loader: "url-loader",
                    include: /src/,
                    options: {
                        limit: 10000,
                        name: "static/files/[name].[hash:7].[ext]",
                        esModule: false,
                    },
                    type: "javascript/auto"
                },
            ],
        },
        devServer: {
            // 端口
            port: 7000,
            // 开启压缩
            compress: true,
            // 打开默认浏览器
            open: true,
            // 模块热更新
            hot: true,
            // 代理
            proxy: {
                "/aLiYun": {
                    target: "https://geo.datav.aliyun.com",   // 后台接口域名
                    secure: true,  // 如果是https接口，需要配置这个参数
                    changeOrigin: true,  //是否跨域
                    pathRewrite: {
                        '^/aLiYun': '',
                    },
                },
                "/aMap": {
                    target: "https://restapi.amap.com",   // 后台接口域名
                    secure: true,  // 如果是https接口，需要配置这个参数
                    changeOrigin: true,  //是否跨域
                    pathRewrite: {
                        '^/aMap': '',
                    },
                }
            }
        },
    },
    css: {
        loaderOptions: {
            // 引入全局样式
            scss: {
                additionalData: `@import "@/components/common/assets/style/CommStyle.scss";`
            }
        }
    }
});
