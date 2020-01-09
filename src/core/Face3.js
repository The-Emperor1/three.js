import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
function Face3( a, b, c, normal, color, materialIndex ) {

	this.a = a;  // 顶点 A 的索引
	this.b = b;  // 顶点 B 的索引
	this.c = c;  // 顶点 C 的索引

	this.normal = ( normal && normal.isVector3 ) ? normal : new Vector3();  // 面的法向量。调用 Geometry.computeFaceNormals 自动计算时，该值等于归一化的两条边的差积。默认值是 (0, 0, 0)
	this.vertexNormals = Array.isArray( normal ) ? normal : [];

	this.color = ( color && color.isColor ) ? color : new Color();  // 面的颜色值，在被用于指定材质的 vertexColors 属性时，该值必须被设置为 THREE.FaceColors
	this.vertexColors = Array.isArray( color ) ? color : []; // 包含 3 个顶点颜色值的队列

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;  // 材质队列中与该面相关的材质的索引。默认值为 0

}

Object.assign( Face3.prototype, {

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy( source.normal );
		this.color.copy( source.color );

		this.materialIndex = source.materialIndex;

		for ( var i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

		}

		for ( var i = 0, il = source.vertexColors.length; i < il; i ++ ) {

			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

		}

		return this;

	}

} );


export { Face3 };
