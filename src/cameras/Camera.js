/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/

import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';

function Camera() {

	Object3D.call( this );

	this.type = 'Camera';

	this.matrixWorldInverse = new Matrix4();  // matrixWorld矩阵的逆矩阵

	this.projectionMatrix = new Matrix4();  // 投影变换矩阵
	this.projectionMatrixInverse = new Matrix4();  // 投影变换矩阵的逆矩阵

}

Camera.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Camera,

	isCamera: true,

	/**
	 * 将源相机相机复制到该相机中
	 * @param {Camera} source 源相机 
	 * @param {Boolen} recursive 是否递归
	 * @returns {Camera} 返回该相机
	 */
	copy: function ( source, recursive ) {

		Object3D.prototype.copy.call( this, source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		return this;

	},

	/**
	 * 返回一个能够表示当前相机所正视的世界空间方向的Vector3对象
	 * @param {Vector3} target 结果将被复制到这个Vector3中 
	 * @returns {Vector3} 返回该对象在世界空间中Z轴正方向的矢量
	 */
	getWorldDirection: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Camera: .getWorldDirection() target is now required' );
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		var e = this.matrixWorld.elements;

		return target.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

	},

	/**
	 * 更新相机及其后代的全局变换
	 * @param {Boolean} force 
	 */
	updateMatrixWorld: function ( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		this.matrixWorldInverse.getInverse( this.matrixWorld );

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );

export { Camera };
