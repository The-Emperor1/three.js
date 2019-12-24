import { _Math } from './Math.js';
import { Quaternion } from './Quaternion.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

var _vector = new Vector3();
var _quaternion = new Quaternion();

/**
 * 构造函数
 * @param {Float} x 向量的x值
 * @param {Float} y 向量的y值
 * @param {Float} z 向量的z值
 */
function Vector3( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

}

Object.assign( Vector3.prototype, {

	isVector3: true,

	/**
	 * 设置向量的值
	 * @param {Float} x 向量的x值
	 * @param {Float} y 向量的y值
	 * @param {Float} z 向量的z值
	 * @returns {Object} 返回该向量
	 */
	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	/**
	 * 使用参数scalar设置向量的x、y、z分量
	 * @param {Float} scalar 参数
	 * @returns {Object} 返回该向量
	 */
	setScalar: function ( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	},

	/**
	 * 使用参数x的值设置该向量的x分量
	 * @param {Float} x 
	 * @returns {Object} 返回该向量
	 */
	setX: function ( x ) {

		this.x = x;

		return this;

	},

	/**
	 * 使用参数y的值设置该向量的y分量
	 * @param {Float} y 
	 * @returns {Object} 返回该向量
	 */
	setY: function ( y ) {

		this.y = y;

		return this;

	},

	/**
	 * 使用参数z的值设置该向量的z分量
	 * @param {Float} z 
	 * @returns {Object} 返回该向量
	 */
	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	/**
	 * 根据索引设置x、y、z分量
	 * @param {Number} index 索引 0,1或者2
	 * @param {Float} value 设置的值
	 * @returns {Object} 返回该向量
	 */
	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	},

	/**
	 * 根据索引获取x、y、z分量的值
	 * @param {Number} index 索引 0,1或者2
	 * @returns {Float} 返回该向量分量的值
	 */
	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	/**
	 * 克隆该向量
	 * @returns {Object} 返回克隆的向量
	 */
	clone: function () {

		return new this.constructor( this.x, this.y, this.z );

	},

	/**
	 * 拷贝v向量中的值到该向量
	 * @param {Object} v 待拷贝向量
	 * @returns {Object} 返回该向量
	 */
	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	/**
	 * 向量求和
	 * @param {Object} v
	 * @returns {Object} 返回该向量与向量v之和
	 */
	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	/**
	 * 将标量值s添加给该向量
	 * @param {Float} s
	 * @returns  {Object} 返回向量v与标量s之和
	 */
	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	/**
	 * 向量求和
	 * @param {Object} a 向量a 
	 * @param {Object} b 向量b
	 * @returns {Object} 返回向量a和向量b之和
	 */
	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	/**
	 * 将v和s的乘积添加到该向量中
	 * @param {Object} v 向量v
	 * @param {Number} s 相乘系数
	 * @returns {Object} 返回求和后的向量
	 */
	addScaledVector: function ( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	},

	/**
	 * 向量相减
	 * @param {Object} v 向量v 
	 * @returns {Object} 返回相减后的向量 
	 */
	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	/**
	 * 将该向量减去标量值s
	 * @param {Float} s 标量
	 * @returns {Object} 返回向量v减去标量s后的向量
	 */
	subScalar: function ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	},

	/**
	 * 设置向量为 a-b
	 * @param {Object} a 向量a
	 * @param {Object} b 向量b
	 * @returns {Object} 返回向量a与向量b之差
	 */
	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	/**
	 * 用向量v乘以该向量
	 * @param {Object} v 向量v
	 * @returns {Object} 返回该向量与向量v之积
	 */
	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	/**
	 * 将该向量乘以标量scalar
	 * @param {Number} scalar 
	 * @returns {Object} 返回相乘后的向量
	 */
	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	/**
	 * 将该向量设置为向量a乘以向量b的结果
	 * @param {Object} a 向量a
	 * @param {Object} b 向量b
	 * @returns {Object} 返回向量a乘以向量b的结果
	 */
	multiplyVectors: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	/**
	 * 对该向量应用欧拉角旋转
	 * @param {Object} euler 欧拉角
	 * @returns 返回旋转后的向量
	 */
	applyEuler: function ( euler ) {

		if ( ! ( euler && euler.isEuler ) ) {

			console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

		}

		return this.applyQuaternion( _quaternion.setFromEuler( euler ) );

	},

	/**
	 * 给这个向量应用由一个轴和一个角度所指定的旋转
	 * @param {Object} axis 旋转轴
	 * @param {Number} angle 旋转角度，弧度
	 * @returns {Object} 返回旋转后的向量
	 */
	applyAxisAngle: function ( axis, angle ) {

		return this.applyQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

	},

	/**
	 * 将该向量乘以一个3×3矩阵
	 * @param {Object} m 3×3矩阵
	 * @returns {Object} 返回变换后的向量
	 */
	applyMatrix3: function ( m ) {

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	},

	/**
	 * 将该向量乘以一个3×3矩阵，并进行归一化
	 * @param {Object} m 3×3矩阵
	 * @returns {Object} 返回变换后的向量
	 */
	applyNormalMatrix: function ( m ) {

		return this.applyMatrix3( m ).normalize();

	},

	/**
	 * 将该向量乘以一个4x4的矩阵
	 * @param {Object} m 4×4矩阵
	 * @returns {Object} 返回变换后的向量
	 */
	applyMatrix4: function ( m ) {

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		var w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	},

	/**
	 * 对该向量应用四元数变换
	 * @param {Object} q 四元素
	 * @returns 返回变换后的矩阵 
	 */
	applyQuaternion: function ( q ) {

		var x = this.x, y = this.y, z = this.z;
		var qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	},

	/**
	 * 用相机投影该向量
	 * @param {Object} 在投影中使用的相机 
	 * @returns {Object} 返回向量的投影结果
	 */
	project: function ( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	},

	/**
	 * 用相机反投影该向量
	 * @param {Object} 在投影中使用的相机 
	 * @returns {Object} 返回向量的投影结果
	 */
	unproject: function ( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	},

	/**
	 * 使用4*4的矩阵变换这个向量的方向，然后将结果归一化
	 * @param {Object} m 4*4矩阵
	 * @returns {Object} 转换后的归一化矩阵
	 */
	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	},

	/**
	 * 把该向量除以向量v
	 * @param {Object} v 向量v
	 * @returns {Object} 相除后的向量
	 */
	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	/**
	 * 将这个向量除以标量s
	 * @param {Number} scalar 标量
	 * @returns 返回相除后的向量 
	 */
	divideScalar: function ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	},

	min: function ( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	},

	max: function ( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	},

	clamp: function ( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	},

	clampScalar: function ( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	},

	clampLength: function ( min, max ) {

		var length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	},

	/**
	 * 将该向量的值向下取整，也就是舍去小数部分
	 * @returns {Object} 返回取整后的向量
	 */
	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	},

	/**
	 * 将该向量的值向上取整，不小于该值的最小整数
	 * @returns {Object} 返回取整后的向量
	 */
	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	},

	/**
	 * 将该向量的值四舍五入
	 * @returns {Object} 返回取整后的向量
	 */
	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	},

	/**
	 * 把向量值向零取整。（如果为负数，则向上取整。如果为正，则向下取整）
	 * @returns {Object}
	 */
	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	/**
	 * 反转该向量
	 * @returns {Object} 返回反转后的向量
	 */
	negate: function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	},

	/**
	 * 计算这个向量和v的点积
	 * @param {Object} v 向量v
	 * @returns {Number} 返回点积
	 */
	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	// TODO lengthSquared?

	/**
	 * 计算该向量的平方长度
	 * @returns {Number} 返回该向量的平方长度
	 */
	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	/**
	 * 计算该向量的长度
	 * @returns {Number} 返回该向量的长度
	 */
	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	manhattanLength: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	/**
	 * 归一化该向量
	 * @returns 返回该向量的归一化结果
	 */
	normalize: function () {

		return this.divideScalar( this.length() || 1 );

	},

	/**
	 * 设置向量的长度
	 * @param {Number} length 
	 * @returns {Object}
	 */
	setLength: function ( length ) {

		return this.normalize().multiplyScalar( length );

	},

	/**
	 * 该向量和向量v之间的线性插值，其中α是沿线的百分比
	 * @param {*} v 向量v
	 * @param {Float} alpha 0 和 1 之间
	 */
	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

	},

	/**
	 * 将该向量设置为自身和v的叉积
	 * @param {Object} v 向量v
	 * @returns {Object} 返回两向量叉积
	 */
	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		return this.crossVectors( this, v );

	},

	/**
	 * 计算向量a与向量b的叉积
	 * @param {Object} a 向量a
	 * @param {Object} b 向量b
	 * @returns {Object} 返回两向量叉积
	 */
	crossVectors: function ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	},

	/**
	 * 将此向量投射到另一个向量
	 * @param {Object} v 向量v 
	 * @returns {Object} 返回投影向量
	 */
	projectOnVector: function ( v ) {

		// v cannot be the zero v

		var scalar = v.dot( this ) / v.lengthSq();

		return this.copy( v ).multiplyScalar( scalar );

	},

	/**
	 * 将此向量投影到一个平面上，通过减去从这个向量投影到平面法线上的向量
	 * @param {Object} planeNormal 表示平面法线的向量
	 * @returns {Object} 返回投影向量
	 */
	projectOnPlane: function ( planeNormal ) {

		_vector.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector );

	},

	/**
	 * 基于给定平面法线的反射线向量。法线具有单位长度
	 * @param {Object} normal 反射面法线
	 * @returns {Object}
	 */
	reflect: function ( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	},

	/**
	 * 求两向量之间的夹角
	 * @param {Object} v 向量v 
	 * @returns {Number} 返回以弧度表示的该向量和向量v之间的夹角
	 */
	angleTo: function ( v ) {

		var denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) console.error( 'THREE.Vector3: angleTo() can\'t handle zero length vectors.' );

		var theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( _Math.clamp( theta, - 1, 1 ) );

	},

	/**
	 * 计算该向量到向量v的距离
	 * @param {Object} v 向量v
	 * @returns {Number} 返回该向量到向量v的距离
	 */
	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	/**
	 * 计算该向量到向量v的平方距离
	 * @param {Object} v 向量v
	 * @returns {Number} 返回该向量到向量v的平方距离
	 */
	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	manhattanDistanceTo: function ( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	},

	/**
	 * 根据球坐标设置向量
	 * @param {*} s 
	 */
	setFromSpherical: function ( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	},

	/**
	 * 根据球坐标设置向量
	 * @param {*} radius 
	 * @param {*} phi 
	 * @param {*} theta 
	 */
	setFromSphericalCoords: function ( radius, phi, theta ) {

		var sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	},

	setFromCylindrical: function ( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	},

	setFromCylindricalCoords: function ( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	},

	/**
	 * 由4*4矩阵设置向量
	 * @param {Object} m 4*4矩阵 
	 */
	setFromMatrixPosition: function ( m ) {

		var e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.setFromMatrixColumn( m, 0 ).length();
		var sy = this.setFromMatrixColumn( m, 1 ).length();
		var sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	},

	/**
	 * 将4*4矩阵的某一行设置为向量的值
	 * @param {Object} m 4*4矩阵 
	 * @param {*} index 矩阵行索引
	 */
	setFromMatrixColumn: function ( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	},

	/**
	 * 判断两个向量是否相等
	 * @param {Object} v 向量v 
	 */
	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	/**
	 * 由数组设置向量值
	 * @param {Object} array 数组
	 * @param {Number} offset 数组偏移量
	 */
	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	},

	/**
	 * 将该向量的x、y、z分量映射到数组
	 * @param {Object} array 数组
	 * @param {Number} offset 数组偏移
	 */
	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	},

	fromBufferAttribute: function ( attribute, index, offset ) {

		if ( offset !== undefined ) {

			console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );

		}

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

} );


export { Vector3 };
