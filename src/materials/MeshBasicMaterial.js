import { Material } from './Material.js';
import { MultiplyOperation } from '../constants.js';
import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new THREE.Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.CubeTexture( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>
 * }
 */

 /**
  * 一个以简单着色（平面或线框）方式来绘制几何体的材质
  * 这种材质不受光照的影响
  * @param {*} parameters 
  */
function MeshBasicMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshBasicMaterial';

	this.color = new Color( 0xffffff ); // 材质的颜色(Color)，默认值为白色 (0xffffff)

	this.map = null; // 颜色贴图。默认为null

	this.lightMap = null;  // 光照贴图。默认值为null。lightMap需要第二组UVs，因此将忽略repeat和offset纹理属性
	this.lightMapIntensity = 1.0;  // 烘焙光的强度。默认值为1

	this.aoMap = null;  // 该纹理的红色通道用作环境遮挡贴图。默认值为null。aoMap需要第二组UVs，因此将忽略repeat和offset属性
	this.aoMapIntensity = 1.0;  // 环境遮挡效果的强度。默认值为1。零是不遮挡效果
 
	this.specularMap = null;  // 材质使用的高光贴图。默认值为null

	this.alphaMap = null;  // alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null

	this.envMap = null;  // 环境贴图。默认值为null
	this.combine = MultiplyOperation;  // 如何将表面颜色的结果与环境贴图（如果有）结合起来
	this.reflectivity = 1;  // 环境贴图对表面的影响程度; 见.combine。默认值为1，有效范围介于0（无反射）和1（完全反射）之间
	this.refractionRatio = 0.98;  // 空气的折射率（IOR）（约为1）除以材质的折射率。

	this.wireframe = false;  // 将几何体渲染为线框。默认值为false（即渲染为平面多边形）
	this.wireframeLinewidth = 1;  // 控制线框宽度。默认值为1
	this.wireframeLinecap = 'round';  // 定义线两端的外观。可选值为 'butt'，'round' 和 'square'。默认为'round'
	this.wireframeLinejoin = 'round';  // 定义线连接节点的样式。可选值为 'round', 'bevel' 和 'miter'。默认值为 'round'

	this.skinning = false;  // 材质是否使用蒙皮。默认值为false
	this.morphTargets = false;  // 材质是否使用morphTargets。默认值为false

	this.setValues( parameters );

}

MeshBasicMaterial.prototype = Object.create( Material.prototype );
MeshBasicMaterial.prototype.constructor = MeshBasicMaterial;

MeshBasicMaterial.prototype.isMeshBasicMaterial = true;

MeshBasicMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.lightMap = source.lightMap;
	this.lightMapIntensity = source.lightMapIntensity;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.specularMap = source.specularMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.combine = source.combine;
	this.reflectivity = source.reflectivity;
	this.refractionRatio = source.refractionRatio;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;

	return this;

};


export { MeshBasicMaterial };
