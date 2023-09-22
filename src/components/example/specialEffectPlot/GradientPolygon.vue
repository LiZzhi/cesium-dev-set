<template>
    <CommPanel title="渐变填充" class="gradient-panel-box">
        <div class="gradient-panel">
            <div class="btn-group">
                <CommButton @click="drawPolygon">绘制</CommButton>
                <CommButton @click="clear" contentClass="clear">清空</CommButton>
            </div>
        </div>
    </CommPanel>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Primitive } from "cesium";
import drawShape from "@/secdev/specialEffectPlot/plot/drawShape";
import gradientAppearance2 from "@/secdev/specialEffectPlot/polygon/gradientAppearance2";

let draw: drawShape;

let primitives:Primitive[] = [];
onMounted(() => {
    // 关闭地形
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    draw = new drawShape(viewer);
});

const drawPolygon = ()=>{
    let positions: number[] = [];
    let colors: number[] = [];
    let indices: number[] = [];
    let colorValue = [0.0, 1.0];
    draw.drawPolygon((ps)=>{
        ps.forEach((v, i) => {
            // 顶点位置
            positions.push(v.x);
            positions.push(v.y);
            positions.push(v.z);
            // 顶点颜色
            colors.push(colorValue[Math.floor(Math.random() * colorValue.length)]);
            colors.push(colorValue[Math.floor(Math.random() * colorValue.length)]);
            colors.push(colorValue[Math.floor(Math.random() * colorValue.length)]);
            colors.push(1.0);
            if (i < ps.length - 2) {
                indices.push(i);
                indices.push(i + 1);
                indices.push(i + 2);
            }
        })
        let attributes = new Cesium.GeometryAttributes();
        attributes.position = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: new Float64Array(positions)
        });
        attributes.color = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 4,
            values: new Float32Array(colors)
        });

        let geometry = new Cesium.Geometry({
            attributes: attributes,
            //索引
            indices: new Uint16Array(indices),
            //绘制类型
            primitiveType: Cesium.PrimitiveType.TRIANGLE_FAN,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });

        let p = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: geometry
            }),
            appearance: gradientAppearance2(),
            asynchronous: false
        })

        primitives.push(p);
        viewer.scene.primitives.add(p);
    })
}

const clear = ()=>{
    primitives.forEach(p=>{
        viewer.scene.primitives.remove(p);
    })
    primitives.length = 0;
}
</script>

<style lang="scss" scoped>
@import "./assets/style/GradientPolygon.scss";
</style>