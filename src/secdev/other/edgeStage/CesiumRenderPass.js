
function executeDerivedCommand(command, nameDerived, commandName, scene, context, passState) {
    const defined = Cesium.defined
    var frameState = scene._frameState;
    var derivedCommands = command.derivedCommands;
    if (!defined(derivedCommands)) {
        return;
    }

    if (frameState.useLogDepth && defined(derivedCommands.logDepth)) {
        command = derivedCommands.logDepth.command;
    }

    derivedCommands = command.derivedCommands;
    if (defined(derivedCommands[nameDerived])) {
        command = derivedCommands[nameDerived][commandName];
        command.execute(context, passState);
    }
}
var scratchPerspectiveFrustum, scratchPerspectiveOffCenterFrustum, scratchOrthographicFrustum, scratchOrthographicOffCenterFrustum, clearCommand;
export function executeDerivedCommandList(context, targetFramebuffer, passState, nameDerived, commandName, filter) {

    const { Pass, defined, PerspectiveFrustum, PerspectiveOffCenterFrustum, OrthographicFrustum, OrthographicOffCenterFrustum } = Cesium

    scratchPerspectiveFrustum = scratchPerspectiveFrustum || new PerspectiveFrustum();
    scratchPerspectiveOffCenterFrustum = scratchPerspectiveOffCenterFrustum || new PerspectiveOffCenterFrustum();
    scratchOrthographicFrustum = scratchOrthographicFrustum || new OrthographicFrustum();
    scratchOrthographicOffCenterFrustum = scratchOrthographicOffCenterFrustum || new OrthographicOffCenterFrustum();


    let us = context._us,
        /**
          * @type {Cesium.FrameState}
          * @private
          */
        frameState = us._frameState,
        camera = frameState.camera,
        /**
         * @type {Cesium.Scene}
         * @private
         */
        scene = camera._scene,
        view = scene._view,
        frustumCommandsList = view.frustumCommandsList,
        numFrustums = frustumCommandsList.length;

    var globeTranslucencyState = scene._globeTranslucencyState;
    var globeTranslucent = globeTranslucencyState.translucent;

    // Create a working frustum from the original camera frustum.
    var frustum;
    if (defined(camera.frustum.fov)) {
        frustum = camera.frustum.clone(scratchPerspectiveFrustum);
    } else if (defined(camera.frustum.infiniteProjectionMatrix)) {
        frustum = camera.frustum.clone(scratchPerspectiveOffCenterFrustum);
    } else if (defined(camera.frustum.width)) {
        frustum = camera.frustum.clone(scratchOrthographicFrustum);
    } else {
        frustum = camera.frustum.clone(scratchOrthographicOffCenterFrustum);
    }

    /**
     * 
     * @param {Cesium.DrawCommand} command 
     * @param {*} scene 
     * @param {*} context 
     * @param {*} passState 
     * @private
     */
    function executeCommand(command, scene, context, passState) {
        let show = filter ? filter(command, scene) : true;
        if (show) {
            if (nameDerived && commandName) {
                executeDerivedCommand(command, nameDerived, commandName, scene, context, passState)
            } else {
                command.execute(context, passState);
            }
        }
    }


    var j, length, commands;
    for (var i = 0; i < numFrustums; ++i) {
        var index = numFrustums - i - 1;
        var frustumCommands = frustumCommandsList[index];

        var originalFramebuffer = passState.framebuffer;
        passState.framebuffer = targetFramebuffer;

        // reset frustum
        frustum.near =
            index !== 0
                ? frustumCommands.near * scene.opaqueFrustumNearOffset
                : frustumCommands.near;
        frustum.far = frustumCommands.far;
        us.updateFrustum(frustum);

        us.updatePass(Pass.GLOBE);
        commands = frustumCommands.commands[Pass.GLOBE];
        length = frustumCommands.indices[Pass.GLOBE];

        if (globeTranslucent) {
            globeTranslucencyState.executeGlobeCommands(
                frustumCommands,
                executeCommand,
                globeTranslucencyFramebuffer,
                scene,
                passState
            );
        } else {
            for (j = 0; j < length; ++j) {
                executeCommand(commands[j], scene, context, passState);
            }
        }

        // if (clearGlobeDepth) {
        //     clearDepth.framebuffer = passState.framebuffer;
        //     clearDepth.execute(context, passState);
        //     clearDepth.framebuffer = undefined;
        // }

        // if (clearGlobeDepth && useDepthPlane) {
        //     depthPlane.execute(context, passState);
        // }

        us.updatePass(Pass.CESIUM_3D_TILE);
        commands = frustumCommands.commands[Pass.CESIUM_3D_TILE];
        length = frustumCommands.indices[Pass.CESIUM_3D_TILE];
        for (j = 0; j < length; ++j) {
            executeCommand(commands[j], scene, context, passState);
        }

        us.updatePass(Pass.OPAQUE);
        commands = frustumCommands.commands[Pass.OPAQUE];
        length = frustumCommands.indices[Pass.OPAQUE];
        for (j = 0; j < length; ++j) {
            executeCommand(commands[j], scene, context, passState);
        }

        us.updatePass(Pass.TRANSLUCENT);
        commands = frustumCommands.commands[Pass.TRANSLUCENT];
        length = frustumCommands.indices[Pass.TRANSLUCENT];
        for (j = 0; j < length; ++j) {
            executeCommand(commands[j], scene, context, passState);
        }

        passState.framebuffer = originalFramebuffer;

    }

}

export const packing = `
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}

vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}

const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8; // tidy overflow
	return r * PackUpscale;
}

float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}

vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ));
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w);
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}

// NOTE: viewZ/eyeZ is < 0 when in front of the camera per OpenGL conventions

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}
`;

const cmz_selected_glsl =
    "uniform sampler2D czm_selectedIdTexture; \n" +
    "uniform float czm_selectedIdTextureStep; \n" +
    "uniform float czm_selectedIdTextureWidth; \n" +

    "bool czm_selected(vec4 id) \n" +
    "{ \n" +
    "    bool selected = false;\n" +
    "    for (int i = 0; i < 1024000; i++) \n" +
    "    { \n" +
    "        vec4 selectedId = texture2D(czm_selectedIdTexture, vec2((float(i) + 0.5) * czm_selectedIdTextureStep, 0.5)); \n" +
    "        if (all(equal(id, selectedId))) \n" +
    "        { \n" +
    "            return true; \n" +
    "        } \n" +
    "       if(float(i)>czm_selectedIdTextureWidth)break;\n" +
    "    } \n" +
    "    return false; \n" +
    "} \n\n";

/**
 * 
 * @param {{
 * name:string
 * vertexShader:string
 * fragmentShader:string
 * renderType?:string
 * uniforms:{[key:string]:string|Cesium.Cartesian2|Cesium.Color|Cesium.Cartesian3|(()=>any)}
 * }} options 
 * @private
 */
export default function CesiumRenderPass(options) {

    const { defaultValue, BoundingRectangle, Pass, Sampler, DrawCommand, Color, ShaderSource, defined, ClearCommand, RenderState, Texture, PixelDatatype, PixelFormat, Framebuffer } = Cesium

    this._selectedIdTexture = null;

    let { name,
        vertexShader,
        fragmentShader,
        uniforms,
        renderStateProcess,
        beforeUpdate,
        renderType,
        textureScale,
        pixelFormat,
        pixelDatatype,
        sampler,
        viewportScale,
        shaderRedefine,
        overrideViewport
    } = options,
        passName = "renderPass_" + name.replace(/[\.\\\/\-]/g, '_'),
        nonMainName = `czm_non_${passName}_main`,
        mainName = `czm_${passName}_main`,
        rsCacheName = `_cache_${passName}`,
        commandName = passName + 'Command',
        framebuffer = null,
        colorTexture = null,
        depthTexture = null,
        stage = null,
        useHdr,
        clearCommand = new ClearCommand({
            color: Color.TRANSPARENT,
            depth: 1
        }),
        viewport = new BoundingRectangle(),
        scope = this

    if (overrideViewport) {
        BoundingRectangle.clone(overrideViewport, viewport)
    }
    shaderRedefine = shaderRedefine || 'add';
    renderType = renderType || 'all';
    textureScale = textureScale || 1;

    if (textureScale < 0 || textureScale > 8) {
        throw new Cesium.DeveloperError('CesiumRenderPass：textureScale必须大于0小于等于8')
    }

    function getShaderProgram(context, shaderProgram, pickId, pickIdQualifier) {

        var shader = context.shaderCache.getDerivedShaderProgram(
            shaderProgram,
            passName
        );
        if (!defined(shader)) {
            var attributeLocations = shaderProgram._attributeLocations;
            var fs = shaderProgram.fragmentShaderSource;
            var vs = shaderProgram.vertexShaderSource;
            var vsStr = shaderProgram._vertexShaderText

            //

            var sources = fs.sources;
            var length = sources.length;

            let hasSelected = !!stage && getSelected();

            var czm_selectedFS = cmz_selected_glsl;
            var is3dtiles = /texture2D\s?\(\s?tile_pickTexture\s?,\s?tile_featureSt\s?\)/.test(pickId)
            if (pickIdQualifier == 'varying' && !is3dtiles) {
                czm_selectedFS += `
varying float me_isSelected;
bool czm_selected(){
    bool isSelected= me_isSelected>0.0000001;
    if(!isSelected){
        isSelected= czm_selected(${pickId});
    }
    return isSelected;
}
    `;
            } else {
                czm_selectedFS += `
bool czm_selected(){ 
    return czm_selected(${pickId}); 
}`
            }


            let czm_selectedVS = cmz_selected_glsl +
                `
varying float me_isSelected;
bool czm_selected(){
    return czm_selected(${pickId});
}
`;

            var hasNormal = false, hasVNormal = false
            if (/attribute\s?vec3\s?normal\s?;/.test(vsStr) || /\n\s?vec3\s?normal\s?;/.test(vsStr)) {
                hasNormal = true
            }
            else if (/varying\s?vec3\s?v_normal\s?;/.test(vsStr)) {
                hasVNormal = true
            }

            if (fragmentShader) {

                var hasPacking = false
                for (i = 0; i < length; ++i) {
                    if (/vec4\s?packDepthToRGBA\s?\(/.test(sources[i])) {
                        hasPacking = true;
                        break;
                    }
                }

                let newMain =
                    (hasPacking ? '' : packing) +
                    (hasSelected ? czm_selectedFS : '') +
                    ShaderSource.replaceMain(fragmentShader, mainName) +
                    "void main() \n" +
                    "{ \n" +
                    (shaderRedefine != 'replace' ? `    ${nonMainName}(); \n` : '') +
                    `    ${mainName}(); \n` +
                    "} \n";
                var newSources = new Array(length + 1);
                for (var i = 0; i < length; ++i) {
                    newSources[i] = ShaderSource.replaceMain(sources[i], nonMainName);
                }
                newSources[length] = newMain;

                if (hasNormal) {
                    fs.defines.push('HAS_NORMAL')
                }
                else if (hasVNormal) {
                    fs.defines.push('HAS_V_NORMAL')
                }

                fs = new ShaderSource({
                    sources: newSources,
                    defines: fs.defines,
                });
            }

            //
            if (vertexShader || fragmentShader) {

                sources = vs.sources;
                length = sources.length;

                var hasPacking = false
                for (i = 0; i < length; ++i) {
                    if (/vec4\s?packDepthToRGBA\s?\(/.test(sources[i])) {
                        hasPacking = true;
                        break
                    }
                }

                hasSelected = hasSelected && pickIdQualifier == 'varying' && !is3dtiles;

                if (hasNormal) {
                    vs.defines.push('HAS_NORMAL')
                }
                else if (hasVNormal) {
                    vs.defines.push('HAS_V_NORMAL')
                }

                let newMain =
                    (hasPacking ? '' : packing) +
                    (hasSelected ? czm_selectedVS : '') +
                    ShaderSource.replaceMain(vertexShader || 'void main(){}', mainName) +
                    "void main() \n" +
                    "{ \n" +
                    (shaderRedefine != 'replace' ? `    ${nonMainName}(); \n` : '') +
                    (hasSelected ? '    me_isSelected=czm_selected()?1.:0.;\n' : '') +
                    `    ${mainName}(); \n` +
                    "} \n";

                var newSources = new Array(length + 1);
                for (var i = 0; i < length; ++i) {
                    newSources[i] = ShaderSource.replaceMain(sources[i], nonMainName);
                }
                newSources[length] = newMain;

                vs = new ShaderSource({
                    sources: newSources,
                    defines: vs.defines,
                });
            }

            shader = context.shaderCache.createDerivedShaderProgram(
                shaderProgram,
                passName,
                {
                    vertexShaderSource: vs,
                    fragmentShaderSource: fs,
                    attributeLocations: attributeLocations,
                }
            );
        }

        return shader;
    }
    function getRenderState(scene, renderState) {

        scene._renderPassCache = scene._renderPassCache || {}
        scene._renderPassCache[rsCacheName] = scene._renderPassCache[rsCacheName] || {}

        var cache = scene._renderPassCache[rsCacheName];
        var cacheRenderState = cache[renderState.id];
        if (!defined(cacheRenderState)) {
            var rs = RenderState.getState(renderState);
            if (typeof renderStateProcess == 'function') {
                renderStateProcess.call(scope, rs);
            }
            cacheRenderState = RenderState.fromCache(rs);
            cache[renderState.id] = cacheRenderState;
        }

        return cacheRenderState;
    }
    function createDerivedCommand(command, scene, context) {

        let originalCommand = command;
        var frameState = scene._frameState;
        var derivedCommands = command.derivedCommands;
        if (!defined(derivedCommands)) {
            return;
        }

        if (frameState.useLogDepth && defined(derivedCommands.logDepth)) {
            command = derivedCommands.logDepth.command;
        }

        derivedCommands = command.derivedCommands;
        let result = derivedCommands.renderPass
        if (!defined(derivedCommands.renderPass)) {
            result = derivedCommands.renderPass = {};
        }

        var shader;
        var renderState;
        if (defined(result[commandName])) {
            shader = result[commandName].shaderProgram;
            renderState = result[commandName].renderState;
        }

        result[commandName] = DrawCommand.shallowClone(command, result[commandName]);

        if (!defined(shader) || result.shaderProgramId !== command.shaderProgram.id) {
            let originalSp = command.shaderProgram
            let pickIdQualifier = originalCommand._pickIdQualifier = new RegExp(`uniform\\s?vec4\\s?${command.pickId}`, 'g').test(originalSp._fragmentShaderText) ? 'uniform' : 'varying'

            result[commandName].shaderProgram = getShaderProgram(
                context,
                originalSp,
                command.pickId,
                pickIdQualifier
            );
            result[commandName].renderState = getRenderState(
                scene,
                command.renderState
            );
            result.shaderProgramId = command.shaderProgram.id;

        } else {
            result[commandName].shaderProgram = shader;
            result[commandName].renderState = renderState;
        }

        //uniformMap 
        var uniformMap = result[commandName].uniformMap
        updateUniformMap(uniformMap)

    }
    function getUniformMapFunction(name) {
        return function () {
            var value = uniforms[name];
            if (typeof value === "function") {
                return value();
            }
            return value;
        };
    }
    function getUniformMapDimensionsFunction(uniformMap, name) {
        return function () {
            var texture = uniformMap[name]();
            if (defined(texture)) {
                return texture.dimensions;
            }
            return undefined;
        };
    }

    function updateUniformMap(uniformMap) {

        if (uniformMap.__created) {
            return;
        }

        uniformMap.czm_selectedIdTexture = function () {
            return stage._selectedIdTexture;
        }

        uniformMap.czm_selectedIdTextureWidth = function () {
            return stage._selectedIdTexture ? stage._selectedIdTexture.width : 0
        }

        uniformMap.czm_selectedIdTextureStep = function () {
            return stage._selectedIdTexture ? 1.0 / stage._selectedIdTexture.width : -1;
        }

        if (!uniforms) {
            return;
        }
        uniformMap.__created = true

        for (var name in uniforms) {
            if (uniforms.hasOwnProperty(name)) {
                if (typeof uniforms[name] !== "function") {
                    uniformMap[name] = getUniformMapFunction(name);

                } else {
                    uniformMap[name] = uniforms[name];
                }

                var value = uniformMap[name]();
                if (
                    typeof value === "string" ||
                    value instanceof Texture ||
                    value instanceof HTMLImageElement ||
                    value instanceof HTMLCanvasElement ||
                    value instanceof HTMLVideoElement
                ) {
                    uniformMap[name + "Dimensions"] = getUniformMapDimensionsFunction(
                        uniformMap,
                        name
                    );
                }
            }
        }

    }

    function udpateDerivedCommands(scene) {
        let view = scene._view,
            frustumCommandsList = view.frustumCommandsList,
            numFrustums = frustumCommandsList.length;

        var j, pass, length;
        for (var i = 0; i < numFrustums; ++i) {
            var index = numFrustums - i - 1;
            var frustumCommands = frustumCommandsList[index];

            for (pass = 0; pass < frustumCommands.commands.length; pass++) {
                var commands = frustumCommands.commands[pass];
                length = frustumCommands.indices[pass];
                if (stage && pass == Pass.GLOBE) continue

                for (j = 0; j < length; ++j) {
                    /**
                     * @type {Cesium.DrawCommand}
                     */
                    var command = commands[j];
                    createDerivedCommand(command, scene, scene._context)
                }
            }
        }

    }
    function releaseResources() {
        if (colorTexture) {
            colorTexture.destroy()
            framebuffer.destroy();
            framebuffer = undefined
            colorTexture = undefined
        }
        if (depthTexture) {
            depthTexture.destroy()
            depthTexture = undefined
        }
    }
    function updateFramebuffer(context, viewport, hdr, sceneFramebuffer) {
        var width = viewport.width;
        var height = viewport.height;

        if (
            colorTexture &&
            colorTexture.width === width &&
            colorTexture.height === height &&
            hdr === useHdr
        ) {
            return;
        }
        useHdr = hdr;

        releaseResources()

        colorTexture = new Texture({
            context: context,
            width: width,
            height: height,
            pixelFormat: defaultValue(pixelFormat, PixelFormat.RGBA),
            pixelDatatype: defaultValue(pixelDatatype, PixelDatatype.FLOAT),
            sampler: defaultValue(sampler, Sampler.NEAREST),
        });
        depthTexture = new Texture({
            context: context,
            width: width,
            height: height,
            pixelFormat: PixelFormat.DEPTH_COMPONENT,
            pixelDatatype: PixelDatatype.UNSIGNED_SHORT,
            sampler: Sampler.NEAREST,
        });

        framebuffer = new Framebuffer({
            colorTextures: [colorTexture],
            context: context,
            destroyAttachments: false
            , depthTexture: depthTexture
            // , depthStencilTexture: sceneFramebuffer._depthStencilTexture,
            // depthStencilRenderbuffer: sceneFramebuffer._depthStencilRenderbuffer
        })

    }

    function getPassState(view) {
        if (!overrideViewport) {
            viewport = BoundingRectangle.clone(view.viewport, viewport)
            if (viewportScale) {
                viewport.x = viewport.width * viewportScale.x;
                viewport.y = viewport.height * viewportScale.y;
                viewport.width *= viewportScale.width;
                viewport.height *= viewportScale.height;
            } else {
                viewport.width *= textureScale;
                viewport.height *= textureScale;
            }
        }

        let passState = Object.assign({}, view.passState);
        passState.viewport = viewport;
        return passState
    }

    function update(context, useLogDepth) {
        const frameState = context._us._frameState,
            camera = frameState.camera,
            scene = camera._scene,
            view = scene._view

        try {

            if (!vertexShader && !fragmentShader) {
                let passState = getPassState(view)
                if (typeof beforeUpdate == 'function') {
                    beforeUpdate.call(scope, scene, useLogDepth);
                }
                updateFramebuffer(context, viewport, scene.hdr, view.sceneFramebuffer);
                executeDerivedCommandList(context, framebuffer, passState);
            } else
            //   if (stage && stage._selectedIdTexture) 
            {
                let passState = getPassState(view)
                if (typeof beforeUpdate == 'function') {
                    beforeUpdate.call(scope, scene, useLogDepth);
                }
                updateFramebuffer(context, viewport, scene.hdr, view.sceneFramebuffer);
                udpateDerivedCommands(scene);
                executeDerivedCommandList(
                    context, framebuffer, passState,
                    'renderPass', commandName,
                    renderType == 'all' || !stage || !stage._selectedIdTexture ? null : commandFilter
                );
            }
        } catch (err) {
            console.error(err);
        }
    }

    function getSelected() {
        if (!stage) return;
        let selectedFeatures = stage.selected || stage.parentSelected
        if (selectedFeatures.length) {
            return selectedFeatures;
        }
    }

    /**
     * 根据stage.selected(被选中的对象)过滤绘图命令，可以减少渲染通道不必要的渲染批次
     * @param {Cesium.DrawCommand} command 
     * @param {Cesium.Scene} scene 
     * @private
     */
    function commandFilter(command, scene) {

        let selectedFeatures = stage && (stage.selected || stage.parentSelected)

        if (!stage || !selectedFeatures || !selectedFeatures.length) return false;
        if (!command.pickId || command._pickIdQualifier != 'uniform') return true;

        let show = true, owner = command.owner;

        let renderSelected = renderType == 'selected';

        if (owner && owner.isObject3D) {
            for (let i = 0; i < selectedFeatures.length; i++) {
                const feature = selectedFeatures[i];
                if (feature == owner) return renderSelected;
            }
            return !renderSelected;
        }

        let uniformMap = command.uniformMap;
        if (uniformMap[command.pickId]) {
            let id = uniformMap[command.pickId]();

            show = !renderSelected;
            for (let i = 0; i < selectedFeatures.length; i++) {
                const feature = selectedFeatures[i];
                let pickIds = feature.pickId ? [feature.pickId] : feature.pickIds || feature._pickIds;
                for (let j = 0; j < pickIds.length; j++) {
                    const pickId = pickIds[j];
                    if (pickId.color == id || Color.equals(pickId.color, id)) {
                        return renderSelected
                    }
                }

            }
        }

        return show;
    }

    function clear(context) {
        if (framebuffer) {
            var view = context._us._frameState.camera._scene._view;
            clearCommand.framebuffer = framebuffer;
            clearCommand.execute(context, view.passState);
            clearCommand.framebuffer = undefined;
        }
    }

    function bindStage(pStage) {
        if (stage && scope.prevStageUpdate) {
            stage.update = scope.prevStageUpdate;
            scope.prevStageUpdate = null
            scope.prevStageExecute = null
        }

        stage = pStage;
        if (!stage) return;

        let oldUpdate = stage.update
        scope.prevStageUpdate = oldUpdate

        stage.update = function (context, useLogDepth) {
            clear(context);
            oldUpdate.call(stage, context, useLogDepth)

            if (!stage.enabled) return;

            if (!vertexShader && !fragmentShader) {
                update(context, useLogDepth)
            } else {
                let selectedFeatures = stage.selected || stage.parentSelected
                if (selectedFeatures && selectedFeatures.length) {
                    update(context, useLogDepth)
                }
            }
        }

    }

    this.update = update;
    this.clear = clear;

    Object.defineProperties(this, {
        texture: {
            get() {
                return colorTexture;
            }
        },
        depthTexture: {
            get() {
                return depthTexture;
            }
        },
        stage: {
            get() {
                return stage;
            },
            set(val) {
                if (stage != val) {
                    bindStage(val);
                }
            }
        }
    })

}
