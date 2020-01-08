import { Quaternion } from '../math/Quaternion.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { EventDispatcher } from './EventDispatcher.js';
import { Euler } from '../math/Euler.js';
import { Layers } from './Layers.js';
import { Matrix3 } from '../math/Matrix3.js';
import { _Math } from '../math/Math.js';

var _object3DId = 0;

var _v1 = new Vector3();
var _q1 = new Quaternion();
var _m1 = new Matrix4();
var _target = new Vector3();

var _position = new Vector3();
var _scale = new Vector3();
var _quaternion = new Quaternion();

var _xAxis = new Vector3( 1, 0, 0 );
var _yAxis = new Vector3( 0, 1, 0 );
var _zAxis = new Vector3( 0, 0, 1 );

var _addedEvent = { type: 'added' };
var _removedEvent = { type: 'removed' };

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author elephantatwork / www.elephantatwork.ch
 */

/**
 * 构造函数
 */
 function Object3D() {

	Object.defineProperty( this, 'id', { value: _object3DId ++ } );  // 只读 —— 表示该对象实例ID的唯一数字。

	this.uuid = _Math.generateUUID();  // 该对象的UUID 由程序自动分配，所以不可编辑

	this.name = '';           // 对象的名称，可选、不必唯一。默认值是一个空字符串
	this.type = 'Object3D';   // 该对象类型

	this.parent = null;       // 该对象在场景图中的父对象
	this.children = [];       // 该对象的子对象数组

	this.up = Object3D.DefaultUp.clone();  // 这个属性由lookAt方法所使用，例如，来决定结果的朝向。 默认值是Object3D.DefaultUp，即( 0, 1, 0 )

	var position = new Vector3();
	var rotation = new Euler();
	var quaternion = new Quaternion();
	var scale = new Vector3( 1, 1, 1 );

	function onRotationChange() {

		quaternion.setFromEuler( rotation, false );

	}

	function onQuaternionChange() {

		rotation.setFromQuaternion( quaternion, undefined, false );

	}

	rotation._onChange( onRotationChange );
	quaternion._onChange( onQuaternionChange );

	Object.defineProperties( this, {
		// 表示对象局部位置的Vector3。默认值为(0, 0, 0)
		position: {
			configurable: true,
			enumerable: true,
			value: position
		},
		// 对象的局部旋转，以弧度来表示
		rotation: {
			configurable: true,
			enumerable: true,
			value: rotation
		},
		// 使用Quaternion表示的对象局部旋转
		quaternion: {
			configurable: true,
			enumerable: true,
			value: quaternion
		},
		// 对象的局部缩放因子。默认值是Vector3( 1, 1, 1 )
		scale: {
			configurable: true,
			enumerable: true,
			value: scale
		},
		// 这个值传递给着色器，用于计算物体的位置
		modelViewMatrix: {
			value: new Matrix4()
		},
		// 这个值传递给着色器，用于计算物体的光照。 它是物体的modelViewMatrix矩阵中，左上角3x3子矩阵的逆的转置矩阵。
		normalMatrix: {
			value: new Matrix3()
		}
	} );

	this.matrix = new Matrix4();         // 对象的局部变换
	this.matrixWorld = new Matrix4();    // 对象的全局变换。如果该Object3D没有父对象，那么它和局部变换相同

	this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;   // 当设置为true时会自动更新矩阵，包括计算位置矩阵（旋转或四元数），逐帧缩放，也会重新计算世界矩阵（matrixWorld）属性
	this.matrixWorldNeedsUpdate = false;   // 当设置为true时，会计算该帧中的世界矩阵属性，然后重置该属性为false

	this.layers = new Layers();  // 对象的层成员关系。该对象只有在与正在使用的相机至少有一层相同时才可见
	this.visible = true;         // 是否可见，如果为true，则对象被渲染

	this.castShadow = false;     // 对象是否被渲染到阴影贴图中。默认值为false
	this.receiveShadow = false;  // 材质是否接收阴影。默认值为false

	this.frustumCulled = true;   // 当设置为true时，每一帧都会检查该对象是否在相机的视椎体中。否则，即使它是不可见的，对象也会得到绘制
	this.renderOrder = 0;  // 这个值覆盖场景图中的默认的渲染顺序，即使不透明对象和透明对象保持独立顺序。 渲染顺序是由低到高来排序的，默认值为0。

	this.userData = {};    // 用于存储Object3D自定义数据的对象。 它不应当包含对函数的引用，因为这些函数将不会被克隆

}

Object3D.DefaultUp = new Vector3( 0, 1, 0 );
Object3D.DefaultMatrixAutoUpdate = true;

Object3D.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: Object3D,

	isObject3D: true,

	onBeforeRender: function () {},
	onAfterRender: function () {},

	/**
	 * 对当前对象应用这个变换矩阵，并更新对象的位置、旋转和缩放
	 * @param {Matrix4} matrix 
	 */
	applyMatrix: function ( matrix ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	},

	/**
	 * 对当前对象应用由四元数所表示的变换
	 * @param {Quaternion} q 
	 * @returns {Object3D} 返回当前对象
	 */
	applyQuaternion: function ( q ) {

		this.quaternion.premultiply( q );

		return this;

	},

	/**
	 * 绕通过局部空间的axis轴和旋转角度设置.quaternion 
	 * @param {Vector3} axis 局部空间中的标准化向量
	 * @param {Float} angle 角度（弧度）
	 */
	setRotationFromAxisAngle: function ( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	},

	/**
	 * 通过欧拉角设置.quaternion
	 * @param {Euler} euler 指定了旋转量的欧拉角 
	 */
	setRotationFromEuler: function ( euler ) {

		this.quaternion.setFromEuler( euler, true );

	},

	/**
	 * 通过矩阵中的旋转分量来旋转设置.quaternion
	 * @param {Matrix3} m
	 */
	setRotationFromMatrix: function ( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	},

	/**
	 * 将所给的四元数复制到.quaternion中
	 * @param {Quaternion} q 
	 */
	setRotationFromQuaternion: function ( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	},

	/**
	 * 在局部空间中绕着axis轴来旋转该对象
	 * @param {Vector3} axis 局部空间中的标准化向量
	 * @param {Float} angle 角度（弧度） 
	 * @returns {Object3D} 返回当前对象
	 */
	rotateOnAxis: function ( axis, angle ) {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.multiply( _q1 );

		return this;

	},

	/**
	 * 在世界空间中绕着axis轴来旋转该对象
	 * @param {Vector3} axis 世界空间中的标准化向量
	 * @param {Float} angle 角度（弧度） 
	 * @returns {Object3D} 返回当前对象
	 */
	rotateOnWorldAxis: function ( axis, angle ) {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.premultiply( _q1 );

		return this;

	},

	/**
	 * 绕局部空间的X轴旋转该对象
	 * @param {Float} angle 旋转角度（弧度）
	 * @returns {Object3D} 返回当前对象
	 */
	rotateX: function ( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	},

	/**
	 * 绕局部空间的Y轴旋转该对象
	 * @param {Float} angle 旋转角度（弧度）
	 * @returns {Object3D} 返回当前对象
	 */
	rotateY: function ( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	},

	/**
	 * 绕局部空间的Z轴旋转该对象
	 * @param {Float} angle 旋转角度（弧度）
	 * @returns {Object3D} 返回当前对象
	 */
	rotateZ: function ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	},

	/**
	 * 在局部空间中沿着一条轴来平移该对象
	 * @param {Vector3} axis 世界空间中的标准化向量
	 * @param {Float} angle 角度（弧度） 
	 * @returns {Object3D} 返回当前对象
	 */
	translateOnAxis: function ( axis, distance ) {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		_v1.copy( axis ).applyQuaternion( this.quaternion );

		this.position.add( _v1.multiplyScalar( distance ) );

		return this;

	},

	/**
	 * 沿着X轴将该对象平移distance个单位
	 * @param {Float} distance 平移距离 
	 * @returns {Object3D} 返回当前对象
	 */
	translateX: function ( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	},

	/**
	 * 沿着Y轴将该对象平移distance个单位
	 * @param {Float} distance 平移距离 
	 * @returns {Object3D} 返回当前对象
	 */
	translateY: function ( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	},

	/**
	 * 沿着Z轴将该对象平移distance个单位
	 * @param {Float} distance 平移距离 
	 * @returns {Object3D} 返回当前对象
	 */
	translateZ: function ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	},

	/**
	 * 将局部空间向量转换为世界空间向量
	 * @param {Vector3} vector 一个局部向量
	 * @returns {Vector3} 返回世界空间向量
	 */
	localToWorld: function ( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	},

	/**
	 * 将世界空间中的向量转换为局部空间向量
	 * @param {Vector3} vector 一个世界向量 
	 * @returns {Vector3} 返回局部空间向量
	 */
	worldToLocal: function ( vector ) {

		return vector.applyMatrix4( _m1.getInverse( this.matrixWorld ) );

	},

	/**
	 * 旋转物体使其在世界空间中面朝一个点
	 * @param {Float} x 
	 * @param {Float} y 
	 * @param {Float} z 
	 */
	lookAt: function ( x, y, z ) {

		// This method does not support objects having non-uniformly-scaled parent(s)

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		var parent = this.parent;

		this.updateWorldMatrix( true, false );

		_position.setFromMatrixPosition( this.matrixWorld );

		if ( this.isCamera || this.isLight ) {

			_m1.lookAt( _position, _target, this.up );

		} else {

			_m1.lookAt( _target, _position, this.up );

		}

		this.quaternion.setFromRotationMatrix( _m1 );

		if ( parent ) {

			_m1.extractRotation( parent.matrixWorld );
			_q1.setFromRotationMatrix( _m1 );
			this.quaternion.premultiply( _q1.inverse() );

		}

	},

	/**
	 * 添加对象到这个对象的子级，可以添加任意数量的对象。 当前传入的对象中的父级将在这里被移除，因为一个对象仅能有一个父级
	 * @param {Object3D} object 
	 * @returns {Object3D} 返回该对象
	 */
	add: function ( object ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error( "THREE.Object3D.add: object can't be added as a child of itself.", object );
			return this;

		}

		if ( ( object && object.isObject3D ) ) {

			if ( object.parent !== null ) {

				object.parent.remove( object );

			}

			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

		} else {

			console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );

		}

		return this;

	},

	/**
	 * 从当前对象的子级中移除对象。可以移除任意数量的对象
	 * @param {Object3D} object 
	 * @returns {Object3D} 返回该对象
	 */	
	remove: function ( object ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

		}

		return this;

	},

	/**
	 * 将object作为子级来添加到该对象中，同时保持该object的世界变换
	 * @param {Object3D} object 
	 * @returns {Object3D} 返回该对象
	 */
	attach: function ( object ) {

		// adds object as a child of this, while maintaining the object's world transform

		this.updateWorldMatrix( true, false );

		_m1.getInverse( this.matrixWorld );

		if ( object.parent !== null ) {

			object.parent.updateWorldMatrix( true, false );

			_m1.multiply( object.parent.matrixWorld );

		}

		object.applyMatrix( _m1 );

		object.updateWorldMatrix( false, false );

		this.add( object );

		return this;

	},

	/**
	 * 搜索该对象的子级，返回第一个带有匹配id的子对象
	 * @param {Integer} id 标识该对象实例的唯一数字 
	 * @returns {Object3D} 返回该对象的id子对象
	 */
	getObjectById: function ( id ) {

		return this.getObjectByProperty( 'id', id );

	},

	/**
	 * 搜索该对象的子级，返回第一个带有匹配name的子对象
	 * @param {String} name 用于来匹配子对象中Object3D.name属性的字符串
	 * @returns {Object3D} 返回该对象name的子对象
	 */
	getObjectByName: function ( name ) {

		return this.getObjectByProperty( 'name', name );

	},

	/**
	 * 搜索该对象的子级，返回第一个给定的属性中包含有匹配的值的子对象
	 * @param {String} name 将要用于查找的属性的名称 
	 * @param {Float} value 给定的属性的值 
	 * @returns {Object3D} 返回该对象name的子对象
	 */
	getObjectByProperty: function ( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			var object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	},

	/**
	 * 返回一个表示该对象在世界空间中位置的矢量 
	 * @param {Vector3} target 结果将被复制到这个Vector3中 
	 * @returns {Vector3} 返回该对象在世界空间中位置的矢量
	 */
	getWorldPosition: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Object3D: .getWorldPosition() target is now required' );
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		return target.setFromMatrixPosition( this.matrixWorld );

	},

	/**
	 * 返回一个表示该对象在世界空间中旋转的四元数
	 * @param {Quaternion} target 结果将被复制到这个target中
	 * @returns {Quaternion} 返回该对象在世界空间中旋转的四元数
	 */
	getWorldQuaternion: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Object3D: .getWorldQuaternion() target is now required' );
			target = new Quaternion();

		}

		this.updateMatrixWorld( true );

		this.matrixWorld.decompose( _position, target, _scale );

		return target;

	},

	/**
	 * 返回一个包含着该物体在世界空间中各个轴向上所应用的缩放因数的矢量
	 * @param {Vector3} target 结果将被复制到这个Vector3中 
	 * @returns {Vector3} 返回该对象在世界空间中缩放因数的矢量
	 */
	getWorldScale: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Object3D: .getWorldScale() target is now required' );
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		this.matrixWorld.decompose( _position, _quaternion, target );

		return target;

	},

	/**
	 * 返回一个表示该物体在世界空间中Z轴正方向的矢量
	 * @param {Vector3} target 结果将被复制到这个Vector3中 
	 * @returns {Vector3} 返回该对象在世界空间中Z轴正方向的矢量
	 */
	getWorldDirection: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Object3D: .getWorldDirection() target is now required' );
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		var e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	},

	/**
	 * 抽象方法，在一条被投射出的射线与这个对象之间获得交点。 在一些子类，例如Mesh, Line, and Points实现了这个方法，以用于光线投射
	 */
	raycast: function () {},

	/**
	 * 在对象以及后代中执行的回调函数
	 * @param {Function} callback 回调函数
	 */
	traverse: function ( callback ) {

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	},

	/**
	 * 类似traverse函数，traverseVisible的回调函数仅对可见的对象执行，不可见对象的后代将不遍历
	 * @param {Function} callback 回调函数 
	 */
	traverseVisible: function ( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	},

	/**
	 * 在所有的祖先中执行回调函数
	 * @param {Function} callback 回调函数 
	 */
	traverseAncestors: function ( callback ) {

		var parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	},

	/**
	 * 根据position、quaternion、scale更新局部变换
	 */
	updateMatrix: function () {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	},

	/**
	 * 更新该对象及其后代的全局变换
	 * @param {Boolean} force 
	 */
	updateMatrixWorld: function ( force ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( force );

		}

	},

	/**
	 * 更新该对象的全局变换
	 * @param {Boolean} updateParents 是否更新该对象祖先的全局变换
	 * @param {Boolean} updateChildren 是否更新该对象子代的全局变换
	 */
	updateWorldMatrix: function ( updateParents, updateChildren ) {

		var parent = this.parent;

		if ( updateParents === true && parent !== null ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.parent === null ) {

			this.matrixWorld.copy( this.matrix );

		} else {

			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		// update children

		if ( updateChildren === true ) {

			var children = this.children;

			for ( var i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateWorldMatrix( false, true );

			}

		}

	},

	toJSON: function ( meta ) {

		// meta is a string when called from JSON.stringify
		var isRootObject = ( meta === undefined || typeof meta === 'string' );

		var output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {}
			};

			output.metadata = {
				version: 4.5,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		var object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( this.isInstancedMesh ) {

			object.type = 'InstancedMesh';
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();

		}

		//

		function serialize( library, element ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isMesh || this.isLine || this.isPoints ) {

			object.geometry = serialize( meta.geometries, this.geometry );

			var parameters = this.geometry.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				var shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( var i = 0, l = shapes.length; i < l; i ++ ) {

						var shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.material !== undefined ) {

			if ( Array.isArray( this.material ) ) {

				var uuids = [];

				for ( var i = 0, l = this.material.length; i < l; i ++ ) {

					uuids.push( serialize( meta.materials, this.material[ i ] ) );

				}

				object.material = uuids;

			} else {

				object.material = serialize( meta.materials, this.material );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( var i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );
			var shapes = extractFromCache( meta.shapes );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			var values = [];
			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	},

	clone: function ( recursive ) {

		return new this.constructor().copy( this, recursive );

	},

	copy: function ( source, recursive ) {

		if ( recursive === undefined ) recursive = true;

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < source.children.length; i ++ ) {

				var child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

} );


export { Object3D };
