import { Vector3 } from './Vector3.js';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 * @author tschw
 */

var _vector = new Vector3();

function Matrix3() {

	this.elements = [

		1, 0, 0,
		0, 1, 0,
		0, 0, 1

	];

	if ( arguments.length > 0 ) {

		console.error( 'THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.' );

	}

}

Object.assign( Matrix3.prototype, {

	isMatrix3: true,

	set: function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		var te = this.elements;

		te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
		te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
		te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

		return this;

	},

	/**
	 * 将此矩阵重置为3x3单位矩阵
	 * @returns {Matrix3} 返回单位化后的该矩阵
	 */
	identity: function () {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	},

	clone: function () {

		return new this.constructor().fromArray( this.elements );

	},

	copy: function ( m ) {

		var te = this.elements;
		var me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

		return this;

	},

	setFromMatrix4: function ( m ) {

		var me = m.elements;

		this.set(

			me[ 0 ], me[ 4 ], me[ 8 ],
			me[ 1 ], me[ 5 ], me[ 9 ],
			me[ 2 ], me[ 6 ], me[ 10 ]

		);

		return this;

	},

	applyToBufferAttribute: function ( attribute ) {

		for ( var i = 0, l = attribute.count; i < l; i ++ ) {

			_vector.x = attribute.getX( i );
			_vector.y = attribute.getY( i );
			_vector.z = attribute.getZ( i );

			_vector.applyMatrix3( this );

			attribute.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return attribute;

	},

	/**
	 * 将当前矩阵乘以矩阵m
	 * @param {Matrix3} m
	 * @returns {Matrix3} 返回当前矩阵 
	 */
	multiply: function ( m ) {

		return this.multiplyMatrices( this, m );

	},

	/**
	 * 将矩阵m乘以当前矩阵
	 * @param {Matrix3} m 
	 * @returns {Matrix3} 返回当前矩阵
	 */
	premultiply: function ( m ) {

		return this.multiplyMatrices( m, this );

	},

	/**
	 * 设置当前矩阵为矩阵a x 矩阵b
	 * @param {Matrix3} a 
	 * @param {Matrix3} b 
	 * @returns {Matrix3} 返回当前矩阵
	 */
	multiplyMatrices: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

		var a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		var a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		var a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		var b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		var b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		var b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	},

	/**
	 * 当前矩阵所有的元素乘以该缩放值s
	 * @param {Float} s 
	 * @returns {Matrix3} 返回当前矩阵
	 */
	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

		return this;

	},

	/**
	 * 计算并返回矩阵的行列式
	 * @returns 返回当前矩阵的行列式
	 */
	determinant: function () {

		var te = this.elements;

		var a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

	},

	/**
	 * 求矩阵的逆矩阵
	 * @param {Matrix3} matrix 取逆的矩阵
	 * @param {Boolean} throwOnDegenerate 如果设置为true，如果矩阵是退化的（如果不可逆的话），则会抛出一个错误
	 * @returns {Matrix3} 将该矩阵的设置为matrix的逆矩阵
	 */
	getInverse: function ( matrix, throwOnDegenerate ) {

		if ( matrix && matrix.isMatrix4 ) {

			console.error( "THREE.Matrix3: .getInverse() no longer takes a Matrix4 argument." );

		}

		var me = matrix.elements,
			te = this.elements,

			n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
			n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
			n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if ( det === 0 ) {

			var msg = "THREE.Matrix3: .getInverse() can't invert matrix, determinant is 0";

			if ( throwOnDegenerate === true ) {

				throw new Error( msg );

			} else {

				console.warn( msg );

			}

			return this.identity();

		}

		var detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		return this;

	},

	/**
	 * 将该矩阵转置
	 * @returns {Matrix3} 返回该矩阵的转置
	 */
	transpose: function () {

		var tmp, m = this.elements;

		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

		return this;

	},

	/**
	 * 将该矩阵设置为给定矩阵的正规矩阵Normal Matrix（左上角的3x3）。正规矩阵是矩阵m的逆矩阵inverse 的转置transpose
	 * @param {Matrix4} matrix4 
	 * @returns {Matrix3} 返回该矩阵
	 */
	getNormalMatrix: function ( matrix4 ) {

		return this.setFromMatrix4( matrix4 ).getInverse( this ).transpose();

	},

	/**
	 * 将该矩阵的转置矩阵设置到数组中
	 * @param {Array} r 用于存储当前矩阵转置结果的数组
	 * @returns {Matrix3} 返回该矩阵
	 */
	transposeIntoArray: function ( r ) {

		var m = this.elements;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	},

	/**
	 * 使用偏移，重复，旋转和中心点位置设置UV变换矩阵
	 * @param {Float} tx x偏移量
	 * @param {Float} ty y偏移量
	 * @param {Float} sx x方向的重复比例
	 * @param {Float} sy y方向的重复比例
	 * @param {Float} rotation 旋转（弧度）
	 * @param {Float} cx 旋转中心x
	 * @param {Float} cy 旋转中心y
	 * @returns {Matrix3} 返回该矩阵
	 */
	setUvTransform: function ( tx, ty, sx, sy, rotation, cx, cy ) {

		var c = Math.cos( rotation );
		var s = Math.sin( rotation );

		this.set(
			sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
			- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
			0, 0, 1
		);

	},

	scale: function ( sx, sy ) {

		var te = this.elements;

		te[ 0 ] *= sx; te[ 3 ] *= sx; te[ 6 ] *= sx;
		te[ 1 ] *= sy; te[ 4 ] *= sy; te[ 7 ] *= sy;

		return this;

	},

	rotate: function ( theta ) {

		var c = Math.cos( theta );
		var s = Math.sin( theta );

		var te = this.elements;

		var a11 = te[ 0 ], a12 = te[ 3 ], a13 = te[ 6 ];
		var a21 = te[ 1 ], a22 = te[ 4 ], a23 = te[ 7 ];

		te[ 0 ] = c * a11 + s * a21;
		te[ 3 ] = c * a12 + s * a22;
		te[ 6 ] = c * a13 + s * a23;

		te[ 1 ] = - s * a11 + c * a21;
		te[ 4 ] = - s * a12 + c * a22;
		te[ 7 ] = - s * a13 + c * a23;

		return this;

	},

	translate: function ( tx, ty ) {

		var te = this.elements;

		te[ 0 ] += tx * te[ 2 ]; te[ 3 ] += tx * te[ 5 ]; te[ 6 ] += tx * te[ 8 ];
		te[ 1 ] += ty * te[ 2 ]; te[ 4 ] += ty * te[ 5 ]; te[ 7 ] += ty * te[ 8 ];

		return this;

	},

	/**
	 * 判断矩阵是否相等
	 * @param {Matrix3} matrix 
	 * @returns 如果矩阵matrix与当前矩阵所有对应元素相同则返回true
	 */
	equals: function ( matrix ) {

		var te = this.elements;
		var me = matrix.elements;

		for ( var i = 0; i < 9; i ++ ) {

			if ( te[ i ] !== me[ i ] ) return false;

		}

		return true;

	},

	/**
	 * 使用基于列优先格式column-major的数组来设置该矩阵
	 * @param {Array} array 用来存储设置元素数据的数组
	 * @param {Integer} offset (可选参数) 数组的偏移量，默认值为 0。
	 * @returns {Matrix3} 返回该矩阵
	 */
	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		for ( var i = 0; i < 9; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	},

	/**
	 * 使用列优先column-major格式将此矩阵的元素写入数组中
	 * @param {Array} array (可选参数) 存储矩阵元素的数组，如果未指定会创建一个新的数组
	 * @param {Integer} offset (可选参数) 存放矩阵元素数组的偏移量
	 * @returns {Array} 返回数组
	 */
	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		var te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];

		return array;

	}

} );


export { Matrix3 };
