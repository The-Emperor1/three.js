/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */

import { LineSegments } from '../objects/LineSegments.js';
import { VertexColors } from '../constants.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

/**
 * 用于简单模拟3个坐标轴的对象.
 * 红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
 * @param {Number} size (可选的) 表示代表轴的线段长度. 默认为 1
 */
function AxesHelper( size ) {

	size = size || 1;

	var vertices = [
		0, 0, 0,	size, 0, 0,
		0, 0, 0,	0, size, 0,
		0, 0, 0,	0, 0, size
	];

	var colors = [
		1, 0, 0,	1, 0.6, 0,
		0, 1, 0,	0.6, 1, 0,
		0, 0, 1,	0, 0.6, 1
	];

	var geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: VertexColors } );

	LineSegments.call( this, geometry, material );

}

AxesHelper.prototype = Object.create( LineSegments.prototype );
AxesHelper.prototype.constructor = AxesHelper;


export { AxesHelper };
