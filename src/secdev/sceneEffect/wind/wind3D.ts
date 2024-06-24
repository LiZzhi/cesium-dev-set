/*
 * @Author: Xingtao 362042734@qq.com
 * @Date: 2024-04-29 09:07:47
 * @LastEditors: Xingtao 362042734@qq.com
 * @LastEditTime: 2024-06-21 10:30:04
 * @FilePath: \cesium-secdev-set\src\secdev\sceneEffect\wind\wind3D.ts
 * @Description: 风场特效
 */
import {
    BoundingSphere,
    Cartesian2,
    Rectangle,
    Viewer,
    PrimitiveCollection,
} from "cesium";
import { NetCDFReader } from "netcdfjs";
import uuid from "@/utils/uuid";
import segmentDrawVert from "./wind3DGlsl/segmentDraw.vert";
import segmentDrawFrag from "./wind3DGlsl/segmentDraw.frag";
import fullscreenVert from "./wind3DGlsl/fullscreen.vert";
import trailDrawFrag from "./wind3DGlsl/trailDraw.frag";
import screenDrawFrag from "./wind3DGlsl/screenDraw.frag";
import calculateSpeedFrag from "./wind3DGlsl/calculateSpeed.frag";
import updatePositionFrag from "./wind3DGlsl/updatePosition.frag";
import postProcessingPositionFrag from "./wind3DGlsl/postProcessingPosition.frag";

export type viewerParametersType = {
    lonRange: Cartesian2;
    latRange: Cartesian2;
    pixelSize: number;
};

export type ncAttrType = {
    array: Float32Array;
    min: number;
    max: number;
};

export type ncDimensionsType = {
    lon: number;
    lat: number;
    lev: number;
};

export type ncDataType = {
    dimensions: ncDimensionsType;
    lon: ncAttrType;
    lat: ncAttrType;
    lev: ncAttrType;
    U: ncAttrType;
    V: ncAttrType;
};

export type windOptionType = {
    particlesTextureSize?: number;
    maxParticles: number;
    particleHeight: number;
    fadeOpacity: number;
    dropRate: number;
    dropRateBump: number;
    speedFactor: number;
    lineWidth: number;
};

export type windPrimitiveType = {
    primitive: PrimitiveCollection;
    removeEvent: () => void;
};

export default class wind3D {
    viewer: Viewer;
    #option: Partial<windOptionType>;
    pid: string;

    globeBoundingSphere: BoundingSphere;
    viewerParameters: viewerParametersType;
    particleSystem: ParticleSystem | undefined;

    collection: PrimitiveCollection;
    constructor(viewer: Viewer) {
        this.viewer = viewer;
        this.#option = {};
        this.pid = uuid();

        this.viewerParameters = {
            lonRange: new Cesium.Cartesian2(),
            latRange: new Cesium.Cartesian2(),
            pixelSize: 0.0,
        };

        // 地球半径,确保到摄像机的距离> 0
        this.globeBoundingSphere = new Cesium.BoundingSphere(
            Cesium.Cartesian3.ZERO,
            0.99 * 6378137.0
        );
        this.updateViewerParameters();
        this.collection = new Cesium.PrimitiveCollection();
    }

    /**
     * @description: 创建风场
     * @param {any} nc nc文件
     * @return { windPrimitiveType } primitive 为 PrimitiveCollection 对象,加入viewer即可使用; removeEvent 为监听事件移除的方法，建议移除后执行该方法以释放内存
     */
    createWind3DPrimitive(nc: any): windPrimitiveType {
        let ncDataProcess = new NCDataProcess(nc);
        this.particleSystem = new ParticleSystem(
            // @ts-ignore
            this.viewer.scene.context,
            ncDataProcess.data,
            this.getOption(),
            this.viewerParameters
        );
        this.addPrimitives();
        let removeEventFunc = this.setupEventListeners();

        return { primitive: this.collection, removeEvent: removeEventFunc };
    }

    /**
     * @description: 设置配置项
     * @param {Partial<windOptionType>} option
     * @return {*}
     */
    setOption(option: Partial<windOptionType> = {}) {
        for (const key in option) {
            if (Object.prototype.hasOwnProperty.call(option, key)) {
                // @ts-ignore
                this.#option[key] = option[key];
            }
        }
        if (this.particleSystem) {
            this.particleSystem.applyUserInput(this.getOption());
        }
    }

    updateViewerParameters() {
        const viewRectangle = this.viewer.camera.computeViewRectangle(
            this.viewer.scene.globe.ellipsoid
        );
        if (viewRectangle) {
            const { lonmin, lonmax, latmin, latmax } =
                this.viewRectangleToLonLatRange(viewRectangle);
            this.viewerParameters.lonRange = new Cesium.Cartesian2(
                lonmin,
                lonmax
            );
            this.viewerParameters.latRange = new Cesium.Cartesian2(
                latmin,
                latmax
            );

            const pixelSize = this.viewer.camera.getPixelSize(
                this.globeBoundingSphere,
                this.viewer.scene.drawingBufferWidth,
                this.viewer.scene.drawingBufferHeight
            );

            if (pixelSize > 0) {
                this.viewerParameters.pixelSize = pixelSize;
            }
        }
    }

    viewRectangleToLonLatRange(rectangle: Rectangle) {
        const postiveWest = Cesium.Math.mod(rectangle.west, Cesium.Math.TWO_PI);
        const postiveEast = Cesium.Math.mod(rectangle.east, Cesium.Math.TWO_PI);
        const width = rectangle.width;

        let longitudeMin: number;
        let longitudeMax: number;

        if (width > Cesium.Math.THREE_PI_OVER_TWO) {
            longitudeMin = 0.0;
            longitudeMax = Cesium.Math.TWO_PI;
        } else {
            if (postiveEast - postiveWest < width) {
                longitudeMin = postiveWest;
                longitudeMax = postiveWest + width;
            } else {
                longitudeMin = postiveWest;
                longitudeMax = postiveEast;
            }
        }

        const south = rectangle.south;
        const north = rectangle.north;
        const height = rectangle.height;

        const extendHeight = height > Cesium.Math.PI / 12 ? height / 2 : 0;
        let extendedSouth = Cesium.Math.clampToLatitudeRange(
            south - extendHeight
        );
        let extendedNorth = Cesium.Math.clampToLatitudeRange(
            north + extendHeight
        );

        // 在高纬度区域扩展边界，以确保它可以覆盖所有可见区域
        if (extendedSouth < -Cesium.Math.PI_OVER_THREE) {
            extendedSouth = -Cesium.Math.PI_OVER_TWO;
        }
        if (extendedNorth > Cesium.Math.PI_OVER_THREE) {
            extendedNorth = Cesium.Math.PI_OVER_TWO;
        }

        return {
            lonmin: Cesium.Math.toDegrees(longitudeMin),
            lonmax: Cesium.Math.toDegrees(longitudeMax),
            latmin: Cesium.Math.toDegrees(extendedSouth),
            latmax: Cesium.Math.toDegrees(extendedNorth),
        };
    }

    addPrimitives() {
        this.collection.removeAll();
        if (this.particleSystem) {
            this.collection.add(
                this.particleSystem.particlesComputing.primitives.calculateSpeed
            );
            this.collection.add(
                this.particleSystem.particlesComputing.primitives.updatePosition
            );
            this.collection.add(
                this.particleSystem.particlesComputing.primitives
                    .postProcessingPosition
            );
            this.collection.add(
                this.particleSystem.particlesRendering.primitives.segments
            );
            this.collection.add(
                this.particleSystem.particlesRendering.primitives.trails
            );
            this.collection.add(
                this.particleSystem.particlesRendering.primitives.screen
            );
        }
    }

    setupEventListeners() {
        const that = this;

        this.viewer.camera.moveStart.addEventListener(function () {
            that.viewer.scene.primitives.show = false;
        });

        this.viewer.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem!.applyViewerParameters(that.viewerParameters);
            that.viewer.scene.primitives.show = true;
        });

        let resized = false;

        function resizeFunc() {
            resized = true;
            that.collection.show = false;
            that.collection.removeAll();
        }
        window.addEventListener("resize", resizeFunc);

        let remove = this.viewer.scene.preRender.addEventListener(function () {
            if (resized) {
                // @ts-ignore
                that.particleSystem.canvasResize(that.viewer.scene.context);
                resized = false;
                that.addPrimitives();
                that.collection.show = true;
            }
        });

        return function () {
            window.removeEventListener("resize", resizeFunc);
            remove();
        };
    }

    getOption() {
        let o = Object.assign(this.defaultOption(), this.#option);
        const particlesTextureSize = Math.ceil(Math.sqrt(o.maxParticles));
        o.particlesTextureSize = particlesTextureSize;
        o.maxParticles = particlesTextureSize * particlesTextureSize;

        return o as Required<windOptionType>;
    }

    defaultOption() {
        return {
            maxParticles: 64 * 64,
            particleHeight: 100.0,
            fadeOpacity: 0.996,
            dropRate: 0.003,
            dropRateBump: 0.01,
            speedFactor: 1.0,
            lineWidth: 4.0,
        };
    }
}

class NCDataProcess {
    data: ncDataType;
    constructor(nc: any) {
        this.data = this.init(nc);
    }

    init(nc: any) {
        const NetCDF = new NetCDFReader(nc);
        const dimensions = this.arrayToMap(NetCDF.dimensions);
        let dimensionsData = {
            lon: dimensions["lon"].size,
            lat: dimensions["lat"].size,
            lev: dimensions["lev"].size,
        };

        let variables = this.arrayToMap(NetCDF.variables);
        let uAttributes = this.arrayToMap(variables["U"].attributes);
        let vAttributes = this.arrayToMap(variables["V"].attributes);

        let lonDataArray = new Float32Array(
            <any>NetCDF.getDataVariable("lon").flat()
        );
        let lonData = {
            array: lonDataArray,
            min: Math.min(...lonDataArray),
            max: Math.max(...lonDataArray),
        };

        let latDataArray = new Float32Array(
            <any>NetCDF.getDataVariable("lat").flat()
        );
        let latData = {
            array: latDataArray,
            min: Math.min(...latDataArray),
            max: Math.max(...latDataArray),
        };

        let levDataArray = new Float32Array(
            <any>NetCDF.getDataVariable("lev").flat()
        );
        let levData = {
            array: levDataArray,
            min: Math.min(...levDataArray),
            max: Math.max(...levDataArray),
        };

        let UDataArray = new Float32Array(
            <any>NetCDF.getDataVariable("U").flat()
        );
        let UData = {
            array: UDataArray,
            min: uAttributes["min"].value,
            max: uAttributes["max"].value,
        };

        let VDataArray = new Float32Array(
            <any>NetCDF.getDataVariable("V").flat()
        );
        let VData = {
            array: VDataArray,
            min: vAttributes["min"].value,
            max: vAttributes["max"].value,
        };

        return {
            dimensions: dimensionsData,
            lon: lonData,
            lat: latData,
            lev: levData,
            U: UData,
            V: VData,
        };
    }

    arrayToMap(array: any[]) {
        return array.reduce((map, object) => {
            map[object.name] = object;
            return map;
        }, {});
    }
}

class ParticleSystem {
    context: any;
    data: ncDataType;
    option: windOptionType;
    viewerParameters: viewerParametersType;
    particlesComputing: ParticlesComputing;
    particlesRendering: ParticlesRendering;
    constructor(
        context: any,
        data: ncDataType,
        option: windOptionType,
        viewerParameters: viewerParametersType
    ) {
        this.context = context;
        this.data = data;
        this.option = option;
        this.viewerParameters = viewerParameters;

        this.particlesComputing = new ParticlesComputing(
            this.context,
            this.data,
            this.option,
            this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context,
            this.data,
            this.option,
            this.viewerParameters,
            this.particlesComputing
        );
    }

    canvasResize(context: any) {
        this.particlesComputing.destroyParticlesTextures();
        Object.keys(this.particlesComputing.windTextures).forEach((key) => {
            this.particlesComputing.windTextures[key].destroy();
        });

        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            this.particlesRendering.framebuffers[key].destroy();
        });

        this.context = context;
        this.particlesComputing = new ParticlesComputing(
            this.context,
            this.data,
            this.option,
            this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context,
            this.data,
            this.option,
            this.viewerParameters,
            this.particlesComputing
        );
    }

    clearFramebuffers() {
        // @ts-ignore
        const clearCommand = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
            depth: 1.0,
            framebuffer: undefined,
            // @ts-ignore
            pass: Cesium.Pass.OPAQUE,
        });

        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            clearCommand.framebuffer =
                this.particlesRendering.framebuffers[key];
            clearCommand.execute(this.context);
        });
    }

    refreshParticles(maxParticlesChanged: boolean) {
        this.clearFramebuffers();

        this.particlesComputing.destroyParticlesTextures();
        this.particlesComputing.createParticlesTextures(
            this.context,
            this.data,
            this.option,
            this.viewerParameters
        );

        if (maxParticlesChanged) {
            let geometry = this.particlesRendering.createSegmentsGeometry(
                this.option
            );
            this.particlesRendering.primitives.segments.geometry = geometry;
            // @ts-ignore
            let vertexArray = Cesium.VertexArray.fromGeometry({
                context: this.context,
                geometry: geometry,
                attributeLocations:
                    this.particlesRendering.primitives.segments
                        .attributeLocations,
                // @ts-ignore
                bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
            });
            this.particlesRendering.primitives.segments.commandToExecute.vertexArray =
                vertexArray;
        }
    }

    applyUserInput(option: windOptionType) {
        let maxParticlesChanged = false;
        if (this.option.maxParticles != option.maxParticles) {
            maxParticlesChanged = true;
        }

        Object.keys(option).forEach((key) => {
            // @ts-ignore
            this.option[key] = option[key];
        });
        this.refreshParticles(maxParticlesChanged);
    }

    applyViewerParameters(viewerParameters: viewerParametersType) {
        Object.keys(viewerParameters).forEach((key) => {
            // @ts-ignore
            this.viewerParameters[key] = viewerParameters[key];
        });
        this.refreshParticles(false);
    }
}

class ParticlesComputing {
    windTextures: any;
    particlesTextures: any;
    primitives: any;
    constructor(
        context: any,
        data: ncDataType,
        option: windOptionType,
        viewerParameters: viewerParametersType
    ) {
        this.createWindTextures(context, data);
        this.createParticlesTextures(context, data, option, viewerParameters);
        this.createComputingPrimitives(data, option, viewerParameters);
    }

    createWindTextures(context: any, data: ncDataType) {
        let windTextureOptions = {
            context: context,
            width: data.dimensions.lon,
            height: data.dimensions.lat * data.dimensions.lev,
            pixelFormat: Cesium.PixelFormat.LUMINANCE,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            // @ts-ignore
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
            }),
        };

        this.windTextures = {
            U: this.createTexture(windTextureOptions, data.U.array),
            V: this.createTexture(windTextureOptions, data.V.array),
        };
    }

    createParticlesTextures(
        context: any,
        data: ncDataType,
        option: windOptionType,
        viewerParameters: viewerParametersType
    ) {
        let particlesTextureOptions = {
            context: context,
            width: option.particlesTextureSize,
            height: option.particlesTextureSize,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            // @ts-ignore
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
            }),
        };

        let particlesArray = this.randomizeParticles(
            data,
            option.maxParticles,
            viewerParameters
        );
        let zeroArray = new Float32Array(4 * option.maxParticles).fill(0);

        this.particlesTextures = {
            previousParticlesPosition: this.createTexture(
                particlesTextureOptions,
                particlesArray
            ),
            currentParticlesPosition: this.createTexture(
                particlesTextureOptions,
                particlesArray
            ),
            nextParticlesPosition: this.createTexture(
                particlesTextureOptions,
                particlesArray
            ),
            postProcessingPosition: this.createTexture(
                particlesTextureOptions,
                particlesArray
            ),

            particlesSpeed: this.createTexture(
                particlesTextureOptions,
                zeroArray
            ),
        };
    }

    destroyParticlesTextures() {
        Object.keys(this.particlesTextures).forEach((key) => {
            this.particlesTextures[key].destroy();
        });
    }

    createComputingPrimitives(
        data: ncDataType,
        option: windOptionType,
        viewerParameters: viewerParametersType
    ) {
        const dimension = new Cesium.Cartesian3(
            data.dimensions.lon,
            data.dimensions.lat,
            data.dimensions.lev
        );
        const minimum = new Cesium.Cartesian3(
            data.lon.min,
            data.lat.min,
            data.lev.min
        );
        const maximum = new Cesium.Cartesian3(
            data.lon.max,
            data.lat.max,
            data.lev.max
        );
        const interval = new Cesium.Cartesian3(
            (maximum.x - minimum.x) / (dimension.x - 1),
            (maximum.y - minimum.y) / (dimension.y - 1),
            dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
        );
        const uSpeedRange = new Cesium.Cartesian2(data.U.min, data.U.max);
        const vSpeedRange = new Cesium.Cartesian2(data.V.min, data.V.max);

        const that = this;

        this.primitives = {
            calculateSpeed: new CustomPrimitive({
                commandType: "Compute",
                uniformMap: {
                    U: function () {
                        return that.windTextures.U;
                    },
                    V: function () {
                        return that.windTextures.V;
                    },
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    dimension: function () {
                        return dimension;
                    },
                    minimum: function () {
                        return minimum;
                    },
                    maximum: function () {
                        return maximum;
                    },
                    interval: function () {
                        return interval;
                    },
                    uSpeedRange: function () {
                        return uSpeedRange;
                    },
                    vSpeedRange: function () {
                        return vSpeedRange;
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    speedFactor: function () {
                        return option.speedFactor;
                    },
                },
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [calculateSpeedFrag],
                }),
                outputTexture: this.particlesTextures.particlesSpeed,
                preExecute: function () {
                    // swap textures before binding
                    const temp = that.particlesTextures.previousParticlesPosition;
                    that.particlesTextures.previousParticlesPosition =
                        that.particlesTextures.currentParticlesPosition;
                    that.particlesTextures.currentParticlesPosition =
                        that.particlesTextures.postProcessingPosition;
                    that.particlesTextures.postProcessingPosition = temp;

                    // keep the outputTexture up to date
                    that.primitives.calculateSpeed.commandToExecute.outputTexture =
                        that.particlesTextures.particlesSpeed;
                },
            }),

            updatePosition: new CustomPrimitive({
                commandType: "Compute",
                uniformMap: {
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    },
                },
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [updatePositionFrag],
                }),
                outputTexture: this.particlesTextures.nextParticlesPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.updatePosition.commandToExecute.outputTexture =
                        that.particlesTextures.nextParticlesPosition;
                },
            }),

            postProcessingPosition: new CustomPrimitive({
                commandType: "Compute",
                uniformMap: {
                    nextParticlesPosition: function () {
                        return that.particlesTextures.nextParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    },
                    lonRange: function () {
                        return viewerParameters.lonRange;
                    },
                    latRange: function () {
                        return viewerParameters.latRange;
                    },
                    randomCoefficient: function () {
                        let randomCoefficient = Math.random();
                        return randomCoefficient;
                    },
                    dropRate: function () {
                        return option.dropRate;
                    },
                    dropRateBump: function () {
                        return option.dropRateBump;
                    },
                },
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [postProcessingPositionFrag],
                }),
                outputTexture: this.particlesTextures.postProcessingPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.postProcessingPosition.commandToExecute.outputTexture =
                        that.particlesTextures.postProcessingPosition;
                },
            }),
        };
    }

    createTexture(options: any, typedArray: Float32Array) {
        if (Cesium.defined(typedArray)) {
            // typed array needs to be passed as source option, this is required by Cesium.Texture
            const source: any = {}
            source.arrayBufferView = typedArray
            options.source = source
        }
        // @ts-ignore
        let texture = new Cesium.Texture(options);
        return texture;
    }

    randomizeParticles(
        data: ncDataType,
        maxParticles: number,
        viewerParameters: viewerParametersType
    ) {
        const array = new Float32Array(4 * maxParticles);
        for (let i = 0; i < maxParticles; i++) {
            array[4 * i] = Cesium.Math.randomBetween(
                viewerParameters.lonRange.x,
                viewerParameters.lonRange.y
            );
            array[4 * i + 1] = Cesium.Math.randomBetween(
                viewerParameters.latRange.x,
                viewerParameters.latRange.y
            );
            array[4 * i + 2] = Cesium.Math.randomBetween(
                data.lev.min,
                data.lev.max
            );
            array[4 * i + 3] = 0.0;
        }
        return array;
    }
}

class ParticlesRendering {
    textures: any;
    framebuffers: any;
    primitives: any;
    constructor(
        context: any,
        data: ncDataType,
        option: windOptionType,
        viewerParameters: viewerParametersType,
        particlesComputing: ParticlesComputing
    ) {
        this.createRenderingTextures(context, data);
        this.createRenderingFramebuffers(context);
        this.createRenderingPrimitives(
            context,
            option,
            viewerParameters,
            particlesComputing
        );
    }

    createRenderingTextures(context: any, data: ncDataType) {
        const colorTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
        };
        const depthTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT,
        };

        this.textures = {
            segmentsColor: this.createTexture(colorTextureOptions),
            segmentsDepth: this.createTexture(depthTextureOptions),

            currentTrailsColor: this.createTexture(colorTextureOptions),
            currentTrailsDepth: this.createTexture(depthTextureOptions),

            nextTrailsColor: this.createTexture(colorTextureOptions),
            nextTrailsDepth: this.createTexture(depthTextureOptions),
        };
    }

    createRenderingFramebuffers(context: any) {
        this.framebuffers = {
            segments: this.createFramebuffer(
                context,
                this.textures.segmentsColor,
                this.textures.segmentsDepth
            ),
            currentTrails: this.createFramebuffer(
                context,
                this.textures.currentTrailsColor,
                this.textures.currentTrailsDepth
            ),
            nextTrails: this.createFramebuffer(
                context,
                this.textures.nextTrailsColor,
                this.textures.nextTrailsDepth
            ),
        };
    }

    createSegmentsGeometry(option: windOptionType) {
        const repeatVertex = 6;

        let stArr: number[] = [];
        let particlesTextureSize = option.particlesTextureSize!;
        for (let s = 0; s < particlesTextureSize; s++) {
            for (let t = 0; t < particlesTextureSize; t++) {
                for (let i = 0; i < repeatVertex; i++) {
                    stArr.push(s / particlesTextureSize);
                    stArr.push(t / particlesTextureSize);
                }
            }
        }
        let st = new Float32Array(stArr);

        let normalArr: number[] = [];
        const pointToUse = [-1, 0, 1];
        const offsetSign = [-1, 1];
        for (let i = 0; i < option.maxParticles; i++) {
            for (let j = 0; j < pointToUse.length; j++) {
                for (let k = 0; k < offsetSign.length; k++) {
                    normalArr.push(pointToUse[j]);
                    normalArr.push(offsetSign[k]);
                    normalArr.push(0);
                }
            }
        }
        let normal = new Float32Array(normalArr);

        const indexSize = 12 * option.maxParticles;
        let vertexIndexes = new Uint32Array(indexSize);
        for (let i = 0, j = 0, vertex = 0; i < option.maxParticles; i++) {
            vertexIndexes[j++] = vertex + 0;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 2;

            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 3;

            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 4;
            vertexIndexes[j++] = vertex + 3;

            vertexIndexes[j++] = vertex + 4;
            vertexIndexes[j++] = vertex + 3;
            vertexIndexes[j++] = vertex + 5;

            vertex += repeatVertex;
        }

        const GeometryAttributes = Cesium.GeometryAttributes as any;
        const geometry = new Cesium.Geometry({
            attributes: new GeometryAttributes({
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: st,
                }),
                normal: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: normal,
                }),
            }),
            indices: vertexIndexes,
        });

        return geometry;
    }

    createRenderingPrimitives(
        context: any,
        option: windOptionType,
        viewerParameters: viewerParametersType,
        particlesComputing: ParticlesComputing
    ) {
        const that = this;
        this.primitives = {
            segments: new CustomPrimitive({
                commandType: "Draw",
                attributeLocations: {
                    st: 0,
                    normal: 1,
                },
                geometry: this.createSegmentsGeometry(option),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    previousParticlesPosition: function () {
                        return particlesComputing.particlesTextures
                            .previousParticlesPosition;
                    },
                    currentParticlesPosition: function () {
                        return particlesComputing.particlesTextures
                            .currentParticlesPosition;
                    },
                    postProcessingPosition: function () {
                        return particlesComputing.particlesTextures
                            .postProcessingPosition;
                    },
                    aspect: function () {
                        return (
                            context.drawingBufferWidth /
                            context.drawingBufferHeight
                        );
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    lineWidth: function () {
                        return option.lineWidth;
                    },
                    particleHeight: function () {
                        return option.particleHeight;
                    },
                },
                // @ts-ignore
                vertexShaderSource: new Cesium.ShaderSource({
                    sources: [segmentDrawVert],
                }),
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [segmentDrawFrag],
                }),
                rawRenderState: this.createRawRenderState({
                    // undefined value means let Cesium deal with it
                    viewport: undefined,
                    depthTest: {
                        enabled: true,
                    },
                    depthMask: true,
                }),
                framebuffer: this.framebuffers.segments,
                autoClear: true,
            }),

            trails: new CustomPrimitive({
                commandType: "Draw",
                attributeLocations: {
                    position: 0,
                    st: 1,
                },
                geometry: this.getFullscreenQuad(),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    segmentsColorTexture: function () {
                        return that.textures.segmentsColor;
                    },
                    segmentsDepthTexture: function () {
                        return that.textures.segmentsDepth;
                    },
                    currentTrailsColor: function () {
                        return that.framebuffers.currentTrails.getColorTexture(
                            0
                        );
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.currentTrails.depthTexture;
                    },
                    fadeOpacity: function () {
                        return option.fadeOpacity;
                    },
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                // @ts-ignore
                vertexShaderSource: new Cesium.ShaderSource({
                    defines: ["DISABLE_GL_POSITION_LOG_DEPTH"],
                    sources: [fullscreenVert],
                }),
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    defines: ["DISABLE_LOG_DEPTH_FRAGMENT_WRITE"],
                    sources: [trailDrawFrag],
                }),
                rawRenderState: this.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: true,
                        func: Cesium.DepthFunction.ALWAYS, // always pass depth test for full control of depth information
                    },
                    depthMask: true,
                }),
                framebuffer: this.framebuffers.nextTrails,
                autoClear: true,
                preExecute: function () {
                    // swap framebuffers before binding
                    const temp = that.framebuffers.currentTrails;
                    that.framebuffers.currentTrails =
                        that.framebuffers.nextTrails;
                    that.framebuffers.nextTrails = temp;

                    // keep the framebuffers up to date
                    that.primitives.trails.commandToExecute.framebuffer =
                        that.framebuffers.nextTrails;
                    that.primitives.trails.clearCommand.framebuffer =
                        that.framebuffers.nextTrails;
                },
            }),

            screen: new CustomPrimitive({
                commandType: "Draw",
                attributeLocations: {
                    position: 0,
                    st: 1,
                },
                geometry: this.getFullscreenQuad(),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    trailsColorTexture: function () {
                        return that.framebuffers.nextTrails.getColorTexture(0);
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.nextTrails.depthTexture;
                    },
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                // @ts-ignore
                vertexShaderSource: new Cesium.ShaderSource({
                    defines: ["DISABLE_GL_POSITION_LOG_DEPTH"],
                    sources: [fullscreenVert],
                }),
                // @ts-ignore
                fragmentShaderSource: new Cesium.ShaderSource({
                    defines: ["DISABLE_LOG_DEPTH_FRAGMENT_WRITE"],
                    sources: [screenDrawFrag],
                }),
                rawRenderState: this.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: false,
                    },
                    depthMask: true,
                    blending: {
                        enabled: true,
                    },
                }),
                framebuffer: undefined, // undefined value means let Cesium deal with it
            }),
        };
    }

    createTexture(options: any, typedArray?: Float32Array) {
        if (Cesium.defined(typedArray)) {
            // typed array needs to be passed as source option, this is required by Cesium.Texture
            options.source = {
                arrayBufferView: typedArray,
            };
        }
        // @ts-ignore
        let texture = new Cesium.Texture(options);
        return texture;
    }

    createFramebuffer(context: any, colorTexture: any, depthTexture: any) {
        // @ts-ignore
        let framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [colorTexture],
            depthTexture: depthTexture,
        });
        return framebuffer;
    }

    createRawRenderState(options: any) {
        let translucent = true;
        let closed = false;
        let existing = {
            viewport: options.viewport,
            depthTest: options.depthTest,
            depthMask: options.depthMask,
            blending: options.blending,
        };
        // @ts-ignore
        let rawRenderState = Cesium.Appearance.getDefaultRenderState(
            translucent,
            closed,
            existing
        );
        return rawRenderState;
    }

    getFullscreenQuad() {
        const GeometryAttributes = Cesium.GeometryAttributes as any;
        const fullscreenQuad = new Cesium.Geometry({
            attributes: new GeometryAttributes({
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    //  v3----v2
                    //  |     |
                    //  |     |
                    //  v0----v1
                    // prettier-ignore
                    values: new Float32Array([
                  -1, -1, 0, // v0
                  1, -1, 0, // v1
                  1, 1, 0, // v2
                  -1, 1, 0, // v3
                ]),
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
                }),
            }),
            indices: new Uint32Array([3, 2, 0, 0, 2, 1]),
        });
        return fullscreenQuad;
    }
}

class CustomPrimitive {
    commandType: string;
    geometry: any;
    attributeLocations: any;
    primitiveType: any;
    uniformMap: any;
    vertexShaderSource: any;
    fragmentShaderSource: any;
    rawRenderState: any;
    framebuffer: any;
    outputTexture: any;
    autoClear: any;
    preExecute: any;
    show: boolean;
    commandToExecute: any;
    clearCommand: any;
    constructor(options: any) {
        this.commandType = options.commandType;

        this.geometry = options.geometry;
        this.attributeLocations = options.attributeLocations;
        this.primitiveType = options.primitiveType;

        this.uniformMap = options.uniformMap;

        this.vertexShaderSource = options.vertexShaderSource;
        this.fragmentShaderSource = options.fragmentShaderSource;

        this.rawRenderState = options.rawRenderState;
        this.framebuffer = options.framebuffer;

        this.outputTexture = options.outputTexture;

        this.autoClear = Cesium.defaultValue(options.autoClear, false);
        this.preExecute = options.preExecute;

        this.show = true;
        this.commandToExecute = undefined;
        this.clearCommand = undefined;
        if (this.autoClear) {
            // @ts-ignore
            this.clearCommand = new Cesium.ClearCommand({
                color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
                depth: 1.0,
                framebuffer: this.framebuffer,
                // @ts-ignore
                pass: Cesium.Pass.OPAQUE,
            });
        }
    }

    createCommand(context: any) {
        switch (this.commandType) {
            case "Draw": {
                // @ts-ignore
                const vertexArray = Cesium.VertexArray.fromGeometry({
                    context: context,
                    geometry: this.geometry,
                    attributeLocations: this.attributeLocations,
                    // @ts-ignore
                    bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                });
                // @ts-ignore
                const shaderProgram = Cesium.ShaderProgram.fromCache({
                    context: context,
                    attributeLocations: this.attributeLocations,
                    vertexShaderSource: this.vertexShaderSource,
                    fragmentShaderSource: this.fragmentShaderSource,
                });
                // @ts-ignore
                const renderState = Cesium.RenderState.fromCache(
                    this.rawRenderState
                ); // @ts-ignore
                return new Cesium.DrawCommand({
                    owner: this,
                    vertexArray: vertexArray,
                    primitiveType: this.primitiveType,
                    uniformMap: this.uniformMap,
                    modelMatrix: Cesium.Matrix4.IDENTITY,
                    shaderProgram: shaderProgram,
                    framebuffer: this.framebuffer,
                    renderState: renderState,
                    // @ts-ignore
                    pass: Cesium.Pass.OPAQUE,
                });
            }
            case "Compute": {
                // @ts-ignore
                return new Cesium.ComputeCommand({
                    owner: this,
                    fragmentShaderSource: this.fragmentShaderSource,
                    uniformMap: this.uniformMap,
                    outputTexture: this.outputTexture,
                    persists: true,
                });
            }
        }
    }

    setGeometry(context: any, geometry: any) {
        this.geometry = geometry;
        // @ts-ignore

        const vertexArray = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: this.geometry,
            attributeLocations: this.attributeLocations,
            // @ts-ignore

            bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
        });
        this.commandToExecute.vertexArray = vertexArray;
    }

    update(frameState: any) {
        if (!this.show) {
            return;
        }

        if (!Cesium.defined(this.commandToExecute)) {
            this.commandToExecute = this.createCommand(frameState.context);
        }

        if (Cesium.defined(this.preExecute)) {
            this.preExecute();
        }

        if (Cesium.defined(this.clearCommand)) {
            frameState.commandList.push(this.clearCommand);
        }
        frameState.commandList.push(this.commandToExecute);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        if (Cesium.defined(this.commandToExecute)) {
            this.commandToExecute.shaderProgram =
                this.commandToExecute.shaderProgram &&
                this.commandToExecute.shaderProgram.destroy();
        }
        return Cesium.destroyObject(this);
    }
}
