import { EventDispatcher } from './EventDispatcher.js';
import { Face3 } from './Face3.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Sphere } from '../math/Sphere.js';
import { Box3 } from '../math/Box3.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';
import { Object3D } from './Object3D.js';
import { _Math } from '../math/Math.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author bhouston / http://clara.io
 */

var _geometryId = 0; // Geometry uses even numbers as Id
var _m1 = new Matrix4();
var _obj = new Object3D();
var _offset = new Vector3();

/**
 * 几何模型，所有几何模型的基类
 */
function Geometry() {

	Object.defineProperty( this, 'id', { value: _geometryId += 2 } ); // 这个geometry实例的唯一标识 

	this.uuid = _Math.generateUUID();  // 当前对象实例的 UUID。 该值会被自动分配，请不要修改它

	this.name = '';         // 当前几何的可选别名。默认值是一个空字符串 
	this.type = 'Geometry'; 

	this.vertices = [];     // 顶点的队列，保存了模型中每个顶点的位置信息
	this.colors = [];       // 顶点 colors 队列，与顶点数量和顺序保持一致
	this.faces = [];        // 描述每个顶点之间如何组成模型面的面队列。同时该队列保存面和顶点的法向量和颜色信息
	this.faceVertexUvs = [[]];  // 面的 UV 层的队列，该队列用于将纹理和几何信息进行映射

	this.morphTargets = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.lineDistances = [];  // 用于保存线型几何体中每个顶点间的距离

	this.boundingBox = null;  // Geometry 的外边界矩形，可以通过 .computeBoundingBox() 进行计算，默认值是 null
	this.boundingSphere = null;  // Geometry 的外边界球形，可以通过 .computeBoundingSphere() 进行计算，默认值是 null

	// update flags

	this.elementsNeedUpdate = false;  // 如果faces中的数据被修改，该值需要被设置为 true
	this.verticesNeedUpdate = false;  // 如果vertices中的数据被修改，该值需要被设置为 true
	this.uvsNeedUpdate = false;       // 如果 faceVertexUvs中的数据被修改，该值需要被设置为 true
	this.normalsNeedUpdate = false;   // 如果法向量队列中的数据被修改，该值需要被设置为 true
	this.colorsNeedUpdate = false;    // 如果colors或 face3 的颜色数据被修改，该值需要被设置为 true
	this.lineDistancesNeedUpdate = false;  // 如果 linedistances 中的数据被修改，该值需要被设置为 true
	this.groupsNeedUpdate = false;         // 如果 face3 的 materialIndex 被修改，该值需要被设置为 true

}

Geometry.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: Geometry,

	isGeometry: true,

	/**
	 * 将矩阵信息直接应用于几何体顶点坐标
	 * @param {Matrix4} matrix 
	 * @returns {Geometry} 返回当前Geometry
	 */
	applyMatrix: function ( matrix ) {

		var normalMatrix = new Matrix3().getNormalMatrix( matrix );

		for ( var i = 0, il = this.vertices.length; i < il; i ++ ) {

			var vertex = this.vertices[ i ];
			vertex.applyMatrix4( matrix );

		}

		for ( var i = 0, il = this.faces.length; i < il; i ++ ) {

			var face = this.faces[ i ];
			face.normal.applyMatrix3( normalMatrix ).normalize();

			for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

				face.vertexNormals[ j ].applyMatrix3( normalMatrix ).normalize();

			}

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		this.verticesNeedUpdate = true;
		this.normalsNeedUpdate = true;

		return this;

	},

	/**
	 * 将几何体绕 X 轴旋转参数指定度数。该操作通常在一次处理中完成，但不会在渲染过程中处理
	 * 使用 Object3D.rotation 对模型面片进行实时旋转处理
	 * @param {Float} angle 旋转角度
	 * @returns {Geometry} 返回当前Geometry
	 */
	rotateX: function ( angle ) {

		// rotate geometry around world x-axis

		_m1.makeRotationX( angle );

		this.applyMatrix( _m1 );

		return this;

	},

	/**
	 * 将几何体绕 Y 轴旋转参数指定度数。该操作通常在一次处理中完成，但不会在渲染过程中处理
	 * 使用 Object3D.rotation 对模型面片进行实时旋转处理
	 * @param {Float} angle 旋转角度
	 * @returns {Geometry} 返回当前Geometry
	 */
	rotateY: function ( angle ) {

		// rotate geometry around world y-axis

		_m1.makeRotationY( angle );

		this.applyMatrix( _m1 );

		return this;

	},

	/**
	 * 将几何体绕 Z 轴旋转参数指定度数。该操作通常在一次处理中完成，但不会在渲染过程中处理
	 * 使用 Object3D.rotation 对模型面片进行实时旋转处理
	 * @param {Float} angle 旋转角度
	 * @returns {Geometry} 返回当前Geometry
	 */
	rotateZ: function ( angle ) {

		// rotate geometry around world z-axis

		_m1.makeRotationZ( angle );

		this.applyMatrix( _m1 );

		return this;

	},

	/**
	 * 移动当前几何体。该操作通常在一次处理中完成，但不会在渲染过程中处理。
	 * 使用 Object3D.position 对模型面片进行实时移动处理。
	 * @param {Float} x 
	 * @param {Float} y 
	 * @param {Float} z 
	 * @returns {Geometry} 返回当前Geometry
	 */
	translate: function ( x, y, z ) {

		// translate geometry

		_m1.makeTranslation( x, y, z );

		this.applyMatrix( _m1 );

		return this;

	},

	/**
	 * 缩放几何体大小。该操作通常在一次处理中完成，但不会在渲染过程中处理。
	 * 使用 Object3D.scale 对模型面片进行实时缩放处理。
	 * @param {Float} x 
	 * @param {Float} y 
	 * @param {Float} z 
	 * @returns {Geometry} 返回当前Geometry
	 */	
	scale: function ( x, y, z ) {

		// scale geometry

		_m1.makeScale( x, y, z );

		this.applyMatrix( _m1 );

		return this;

	},

	/**
	 * 该方法将几何体进行旋转。该方法一般在一次处理中完成，但不在渲染过程中执行
	 * 一般使用 Object3D.lookAt 方法进行实时更改
	 * @param {Vector3} vector 当前几何体朝向的世界坐标
	 * @returns {Geometry} 返回当前Geometry
	 */
	lookAt: function ( vector ) {

		_obj.lookAt( vector );

		_obj.updateMatrix();

		this.applyMatrix( _obj.matrix );

		return this;

	},

	/**
	 * 将一个 BufferGeometry 对象，转换成一个 Geometry 对象
	 * @param {BufferGeometry} geometry 
	 * @returns {Geometry} 返回当前Geometry
	 */
	fromBufferGeometry: function ( geometry ) {

		var scope = this;

		var indices = geometry.index !== null ? geometry.index.array : undefined;
		var attributes = geometry.attributes;

		if ( attributes.position === undefined ) {

			console.error( 'THREE.Geometry.fromBufferGeometry(): Position attribute required for conversion.' );
			return this;

		}

		var positions = attributes.position.array;
		var normals = attributes.normal !== undefined ? attributes.normal.array : undefined;
		var colors = attributes.color !== undefined ? attributes.color.array : undefined;
		var uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;
		var uvs2 = attributes.uv2 !== undefined ? attributes.uv2.array : undefined;

		if ( uvs2 !== undefined ) this.faceVertexUvs[ 1 ] = [];

		for ( var i = 0; i < positions.length; i += 3 ) {

			scope.vertices.push( new Vector3().fromArray( positions, i ) );

			if ( colors !== undefined ) {

				scope.colors.push( new Color().fromArray( colors, i ) );

			}

		}

		function addFace( a, b, c, materialIndex ) {

			var vertexColors = ( colors === undefined ) ? [] : [
				scope.colors[ a ].clone(),
				scope.colors[ b ].clone(),
				scope.colors[ c ].clone() ];

			var vertexNormals = ( normals === undefined ) ? [] : [
				new Vector3().fromArray( normals, a * 3 ),
				new Vector3().fromArray( normals, b * 3 ),
				new Vector3().fromArray( normals, c * 3 )
			];

			var face = new Face3( a, b, c, vertexNormals, vertexColors, materialIndex );

			scope.faces.push( face );

			if ( uvs !== undefined ) {

				scope.faceVertexUvs[ 0 ].push( [
					new Vector2().fromArray( uvs, a * 2 ),
					new Vector2().fromArray( uvs, b * 2 ),
					new Vector2().fromArray( uvs, c * 2 )
				] );

			}

			if ( uvs2 !== undefined ) {

				scope.faceVertexUvs[ 1 ].push( [
					new Vector2().fromArray( uvs2, a * 2 ),
					new Vector2().fromArray( uvs2, b * 2 ),
					new Vector2().fromArray( uvs2, c * 2 )
				] );

			}

		}

		var groups = geometry.groups;

		if ( groups.length > 0 ) {

			for ( var i = 0; i < groups.length; i ++ ) {

				var group = groups[ i ];

				var start = group.start;
				var count = group.count;

				for ( var j = start, jl = start + count; j < jl; j += 3 ) {

					if ( indices !== undefined ) {

						addFace( indices[ j ], indices[ j + 1 ], indices[ j + 2 ], group.materialIndex );

					} else {

						addFace( j, j + 1, j + 2, group.materialIndex );

					}

				}

			}

		} else {

			if ( indices !== undefined ) {

				for ( var i = 0; i < indices.length; i += 3 ) {

					addFace( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

				}

			} else {

				for ( var i = 0; i < positions.length / 3; i += 3 ) {

					addFace( i, i + 1, i + 2 );

				}

			}

		}

		this.computeFaceNormals();

		if ( geometry.boundingBox !== null ) {

			this.boundingBox = geometry.boundingBox.clone();

		}

		if ( geometry.boundingSphere !== null ) {

			this.boundingSphere = geometry.boundingSphere.clone();

		}

		return this;

	},

	/**
	 * 基于外边界矩形将几何体居中
	 * @returns {Geometry} 返回当前Geometry
	 */
	center: function () {

		this.computeBoundingBox();

		this.boundingBox.getCenter( _offset ).negate();

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	},

	/**
	 * 将当前几何体归一化, 将当前几何体居中，并且使得该几何体的外边界球半径为 1.0
	 * @returns {Geometry} 返回当前Geometry
	 */
	normalize: function () {

		this.computeBoundingSphere();

		var center = this.boundingSphere.center;
		var radius = this.boundingSphere.radius;

		var s = radius === 0 ? 1 : 1.0 / radius;

		var matrix = new Matrix4();
		matrix.set(
			s, 0, 0, - s * center.x,
			0, s, 0, - s * center.y,
			0, 0, s, - s * center.z,
			0, 0, 0, 1
		);

		this.applyMatrix( matrix );

		return this;

	},

	/**
	 * 计算所有face的normal值
	 */
	computeFaceNormals: function () {

		var cb = new Vector3(), ab = new Vector3();

		for ( var f = 0, fl = this.faces.length; f < fl; f ++ ) {

			var face = this.faces[ f ];

			var vA = this.vertices[ face.a ];
			var vB = this.vertices[ face.b ];
			var vC = this.vertices[ face.c ];

			cb.subVectors( vC, vB );
			ab.subVectors( vA, vB );
			cb.cross( ab );

			cb.normalize();

			face.normal.copy( cb );

		}

	},

	/**
	 * 通过周围面的法向量计算顶点的法向量
	 * @param {Boolean} areaWeighted 如果该值设置为 true，则每个面的法向量对顶点法向量的影响按照面的面积大小来计算。默认值为 true.
	 */
	computeVertexNormals: function ( areaWeighted ) {

		if ( areaWeighted === undefined ) areaWeighted = true;

		var v, vl, f, fl, face, vertices;

		vertices = new Array( this.vertices.length );

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ] = new Vector3();

		}

		if ( areaWeighted ) {

			// vertex normals weighted by triangle areas
			// http://www.iquilezles.org/www/articles/normals/normals.htm

			var vA, vB, vC;
			var cb = new Vector3(), ab = new Vector3();

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				vA = this.vertices[ face.a ];
				vB = this.vertices[ face.b ];
				vC = this.vertices[ face.c ];

				cb.subVectors( vC, vB );
				ab.subVectors( vA, vB );
				cb.cross( ab );

				vertices[ face.a ].add( cb );
				vertices[ face.b ].add( cb );
				vertices[ face.c ].add( cb );

			}

		} else {

			this.computeFaceNormals();

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				vertices[ face.a ].add( face.normal );
				vertices[ face.b ].add( face.normal );
				vertices[ face.c ].add( face.normal );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ].normalize();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			var vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				vertexNormals[ 0 ].copy( vertices[ face.a ] );
				vertexNormals[ 1 ].copy( vertices[ face.b ] );
				vertexNormals[ 2 ].copy( vertices[ face.c ] );

			} else {

				vertexNormals[ 0 ] = vertices[ face.a ].clone();
				vertexNormals[ 1 ] = vertices[ face.b ].clone();
				vertexNormals[ 2 ] = vertices[ face.c ].clone();

			}

		}

		if ( this.faces.length > 0 ) {

			this.normalsNeedUpdate = true;

		}

	},

	/**
	 * 计算 flat vertex normals 值。 该方法会将顶点法向量的值赋值为相应面的法向量值
	 */
	computeFlatVertexNormals: function () {

		var f, fl, face;

		this.computeFaceNormals();

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			var vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				vertexNormals[ 0 ].copy( face.normal );
				vertexNormals[ 1 ].copy( face.normal );
				vertexNormals[ 2 ].copy( face.normal );

			} else {

				vertexNormals[ 0 ] = face.normal.clone();
				vertexNormals[ 1 ] = face.normal.clone();
				vertexNormals[ 2 ] = face.normal.clone();

			}

		}

		if ( this.faces.length > 0 ) {

			this.normalsNeedUpdate = true;

		}

	},

	computeMorphNormals: function () {

		var i, il, f, fl, face;

		// save original normals
		// - create temp variables on first access
		//   otherwise just copy (for faster repeated calls)

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( ! face.__originalFaceNormal ) {

				face.__originalFaceNormal = face.normal.clone();

			} else {

				face.__originalFaceNormal.copy( face.normal );

			}

			if ( ! face.__originalVertexNormals ) face.__originalVertexNormals = [];

			for ( i = 0, il = face.vertexNormals.length; i < il; i ++ ) {

				if ( ! face.__originalVertexNormals[ i ] ) {

					face.__originalVertexNormals[ i ] = face.vertexNormals[ i ].clone();

				} else {

					face.__originalVertexNormals[ i ].copy( face.vertexNormals[ i ] );

				}

			}

		}

		// use temp geometry to compute face and vertex normals for each morph

		var tmpGeo = new Geometry();
		tmpGeo.faces = this.faces;

		for ( i = 0, il = this.morphTargets.length; i < il; i ++ ) {

			// create on first access

			if ( ! this.morphNormals[ i ] ) {

				this.morphNormals[ i ] = {};
				this.morphNormals[ i ].faceNormals = [];
				this.morphNormals[ i ].vertexNormals = [];

				var dstNormalsFace = this.morphNormals[ i ].faceNormals;
				var dstNormalsVertex = this.morphNormals[ i ].vertexNormals;

				var faceNormal, vertexNormals;

				for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

					faceNormal = new Vector3();
					vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3() };

					dstNormalsFace.push( faceNormal );
					dstNormalsVertex.push( vertexNormals );

				}

			}

			var morphNormals = this.morphNormals[ i ];

			// set vertices to morph target

			tmpGeo.vertices = this.morphTargets[ i ].vertices;

			// compute morph normals

			tmpGeo.computeFaceNormals();
			tmpGeo.computeVertexNormals();

			// store morph normals

			var faceNormal, vertexNormals;

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				faceNormal = morphNormals.faceNormals[ f ];
				vertexNormals = morphNormals.vertexNormals[ f ];

				faceNormal.copy( face.normal );

				vertexNormals.a.copy( face.vertexNormals[ 0 ] );
				vertexNormals.b.copy( face.vertexNormals[ 1 ] );
				vertexNormals.c.copy( face.vertexNormals[ 2 ] );

			}

		}

		// restore original normals

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			face.normal = face.__originalFaceNormal;
			face.vertexNormals = face.__originalVertexNormals;

		}

	},

	/**
	 * 计算当前几何体的外边界矩形。该方法会更新 Geometry.boundingBox 属性值
	 */
	computeBoundingBox: function () {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		this.boundingBox.setFromPoints( this.vertices );

	},

	/**
	 * 计算当前几何体的外边界球。该方法会更新 Geometry.boundingSphere 属性值
	 */
	computeBoundingSphere: function () {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		this.boundingSphere.setFromPoints( this.vertices );

	},

	/**
	 * 将两个几何体，或一个几何体和一个从对象中通过变换获得的几何体进行合并
	 * @param {Geometry} geometry 
	 * @param {Matrix4} matrix 
	 * @param {Integer} materialIndexOffset 
	 */
	merge: function ( geometry, matrix, materialIndexOffset ) {

		if ( ! ( geometry && geometry.isGeometry ) ) {

			console.error( 'THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.', geometry );
			return;

		}

		var normalMatrix,
			vertexOffset = this.vertices.length,
			vertices1 = this.vertices,
			vertices2 = geometry.vertices,
			faces1 = this.faces,
			faces2 = geometry.faces,
			colors1 = this.colors,
			colors2 = geometry.colors;

		if ( materialIndexOffset === undefined ) materialIndexOffset = 0;

		if ( matrix !== undefined ) {

			normalMatrix = new Matrix3().getNormalMatrix( matrix );

		}

		// vertices

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = vertex.clone();

			if ( matrix !== undefined ) vertexCopy.applyMatrix4( matrix );

			vertices1.push( vertexCopy );

		}

		// colors

		for ( var i = 0, il = colors2.length; i < il; i ++ ) {

			colors1.push( colors2[ i ].clone() );

		}

		// faces

		for ( i = 0, il = faces2.length; i < il; i ++ ) {

			var face = faces2[ i ], faceCopy, normal, color,
				faceVertexNormals = face.vertexNormals,
				faceVertexColors = face.vertexColors;

			faceCopy = new Face3( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset );
			faceCopy.normal.copy( face.normal );

			if ( normalMatrix !== undefined ) {

				faceCopy.normal.applyMatrix3( normalMatrix ).normalize();

			}

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ].clone();

				if ( normalMatrix !== undefined ) {

					normal.applyMatrix3( normalMatrix ).normalize();

				}

				faceCopy.vertexNormals.push( normal );

			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {

				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );

			}

			faceCopy.materialIndex = face.materialIndex + materialIndexOffset;

			faces1.push( faceCopy );

		}

		// uvs

		for ( var i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

			var faceVertexUvs2 = geometry.faceVertexUvs[ i ];

			if ( this.faceVertexUvs[ i ] === undefined ) this.faceVertexUvs[ i ] = [];

			for ( var j = 0, jl = faceVertexUvs2.length; j < jl; j ++ ) {

				var uvs2 = faceVertexUvs2[ j ], uvsCopy = [];

				for ( var k = 0, kl = uvs2.length; k < kl; k ++ ) {

					uvsCopy.push( uvs2[ k ].clone() );

				}

				this.faceVertexUvs[ i ].push( uvsCopy );

			}

		}

	},

	/**
	 * 将参数指定的面片信息与当前几何体进行合并。同样会使用到参数 mesh 的变换
	 * @param {Mesh} mesh 
	 */
	mergeMesh: function ( mesh ) {

		if ( ! ( mesh && mesh.isMesh ) ) {

			console.error( 'THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.', mesh );
			return;

		}

		if ( mesh.matrixAutoUpdate ) mesh.updateMatrix();

		this.merge( mesh.geometry, mesh.matrix );

	},

	/*
	 * Checks for duplicate vertices with hashmap.
	 * Duplicated vertices are removed
	 * and faces' vertices are updated.
	 */

	 /**
	  * 通过 hashmap 检查重复的顶点
	  * 重复的顶点将会被移除，面的顶点信息会被更新
	  */
	mergeVertices: function () {

		var verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
		var unique = [], changes = [];

		var v, key;
		var precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
		var precision = Math.pow( 10, precisionPoints );
		var i, il, face;
		var indices, j, jl;

		for ( i = 0, il = this.vertices.length; i < il; i ++ ) {

			v = this.vertices[ i ];
			key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );

			if ( verticesMap[ key ] === undefined ) {

				verticesMap[ key ] = i;
				unique.push( this.vertices[ i ] );
				changes[ i ] = unique.length - 1;

			} else {

				//console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
				changes[ i ] = changes[ verticesMap[ key ] ];

			}

		}


		// if faces are completely degenerate after merging vertices, we
		// have to remove them from the geometry.
		var faceIndicesToRemove = [];

		for ( i = 0, il = this.faces.length; i < il; i ++ ) {

			face = this.faces[ i ];

			face.a = changes[ face.a ];
			face.b = changes[ face.b ];
			face.c = changes[ face.c ];

			indices = [ face.a, face.b, face.c ];

			// if any duplicate vertices are found in a Face3
			// we have to remove the face as nothing can be saved
			for ( var n = 0; n < 3; n ++ ) {

				if ( indices[ n ] === indices[ ( n + 1 ) % 3 ] ) {

					faceIndicesToRemove.push( i );
					break;

				}

			}

		}

		for ( i = faceIndicesToRemove.length - 1; i >= 0; i -- ) {

			var idx = faceIndicesToRemove[ i ];

			this.faces.splice( idx, 1 );

			for ( j = 0, jl = this.faceVertexUvs.length; j < jl; j ++ ) {

				this.faceVertexUvs[ j ].splice( idx, 1 );

			}

		}

		// Use unique set of vertices

		var diff = this.vertices.length - unique.length;
		this.vertices = unique;
		return diff;

	},

	/**
	 * 通过点队列设置一个 Geometry 中的顶点
	 * @param {Array} points
	 * @returns {Geometry} 返回当前Geometry
	 */
	setFromPoints: function ( points ) {

		this.vertices = [];

		for ( var i = 0, l = points.length; i < l; i ++ ) {

			var point = points[ i ];
			this.vertices.push( new Vector3( point.x, point.y, point.z || 0 ) );

		}

		return this;

	},

	/**
	 * 通过材质索引对面队列进行排序
	 * 对于复杂且有多个材质的几何体，该操作可以有效减少 draw call 从而提升性能
	 */
	sortFacesByMaterialIndex: function () {

		var faces = this.faces;
		var length = faces.length;

		// tag faces

		for ( var i = 0; i < length; i ++ ) {

			faces[ i ]._id = i;

		}

		// sort faces

		function materialIndexSort( a, b ) {

			return a.materialIndex - b.materialIndex;

		}

		faces.sort( materialIndexSort );

		// sort uvs

		var uvs1 = this.faceVertexUvs[ 0 ];
		var uvs2 = this.faceVertexUvs[ 1 ];

		var newUvs1, newUvs2;

		if ( uvs1 && uvs1.length === length ) newUvs1 = [];
		if ( uvs2 && uvs2.length === length ) newUvs2 = [];

		for ( var i = 0; i < length; i ++ ) {

			var id = faces[ i ]._id;

			if ( newUvs1 ) newUvs1.push( uvs1[ id ] );
			if ( newUvs2 ) newUvs2.push( uvs2[ id ] );

		}

		if ( newUvs1 ) this.faceVertexUvs[ 0 ] = newUvs1;
		if ( newUvs2 ) this.faceVertexUvs[ 1 ] = newUvs2;

	},

	toJSON: function () {

		var data = {
			metadata: {
				version: 4.5,
				type: 'Geometry',
				generator: 'Geometry.toJSON'
			}
		};

		// standard Geometry serialization

		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== '' ) data.name = this.name;

		if ( this.parameters !== undefined ) {

			var parameters = this.parameters;

			for ( var key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		var vertices = [];

		for ( var i = 0; i < this.vertices.length; i ++ ) {

			var vertex = this.vertices[ i ];
			vertices.push( vertex.x, vertex.y, vertex.z );

		}

		var faces = [];
		var normals = [];
		var normalsHash = {};
		var colors = [];
		var colorsHash = {};
		var uvs = [];
		var uvsHash = {};

		for ( var i = 0; i < this.faces.length; i ++ ) {

			var face = this.faces[ i ];

			var hasMaterial = true;
			var hasFaceUv = false; // deprecated
			var hasFaceVertexUv = this.faceVertexUvs[ 0 ][ i ] !== undefined;
			var hasFaceNormal = face.normal.length() > 0;
			var hasFaceVertexNormal = face.vertexNormals.length > 0;
			var hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
			var hasFaceVertexColor = face.vertexColors.length > 0;

			var faceType = 0;

			faceType = setBit( faceType, 0, 0 ); // isQuad
			faceType = setBit( faceType, 1, hasMaterial );
			faceType = setBit( faceType, 2, hasFaceUv );
			faceType = setBit( faceType, 3, hasFaceVertexUv );
			faceType = setBit( faceType, 4, hasFaceNormal );
			faceType = setBit( faceType, 5, hasFaceVertexNormal );
			faceType = setBit( faceType, 6, hasFaceColor );
			faceType = setBit( faceType, 7, hasFaceVertexColor );

			faces.push( faceType );
			faces.push( face.a, face.b, face.c );
			faces.push( face.materialIndex );

			if ( hasFaceVertexUv ) {

				var faceVertexUvs = this.faceVertexUvs[ 0 ][ i ];

				faces.push(
					getUvIndex( faceVertexUvs[ 0 ] ),
					getUvIndex( faceVertexUvs[ 1 ] ),
					getUvIndex( faceVertexUvs[ 2 ] )
				);

			}

			if ( hasFaceNormal ) {

				faces.push( getNormalIndex( face.normal ) );

			}

			if ( hasFaceVertexNormal ) {

				var vertexNormals = face.vertexNormals;

				faces.push(
					getNormalIndex( vertexNormals[ 0 ] ),
					getNormalIndex( vertexNormals[ 1 ] ),
					getNormalIndex( vertexNormals[ 2 ] )
				);

			}

			if ( hasFaceColor ) {

				faces.push( getColorIndex( face.color ) );

			}

			if ( hasFaceVertexColor ) {

				var vertexColors = face.vertexColors;

				faces.push(
					getColorIndex( vertexColors[ 0 ] ),
					getColorIndex( vertexColors[ 1 ] ),
					getColorIndex( vertexColors[ 2 ] )
				);

			}

		}

		function setBit( value, position, enabled ) {

			return enabled ? value | ( 1 << position ) : value & ( ~ ( 1 << position ) );

		}

		function getNormalIndex( normal ) {

			var hash = normal.x.toString() + normal.y.toString() + normal.z.toString();

			if ( normalsHash[ hash ] !== undefined ) {

				return normalsHash[ hash ];

			}

			normalsHash[ hash ] = normals.length / 3;
			normals.push( normal.x, normal.y, normal.z );

			return normalsHash[ hash ];

		}

		function getColorIndex( color ) {

			var hash = color.r.toString() + color.g.toString() + color.b.toString();

			if ( colorsHash[ hash ] !== undefined ) {

				return colorsHash[ hash ];

			}

			colorsHash[ hash ] = colors.length;
			colors.push( color.getHex() );

			return colorsHash[ hash ];

		}

		function getUvIndex( uv ) {

			var hash = uv.x.toString() + uv.y.toString();

			if ( uvsHash[ hash ] !== undefined ) {

				return uvsHash[ hash ];

			}

			uvsHash[ hash ] = uvs.length / 2;
			uvs.push( uv.x, uv.y );

			return uvsHash[ hash ];

		}

		data.data = {};

		data.data.vertices = vertices;
		data.data.normals = normals;
		if ( colors.length > 0 ) data.data.colors = colors;
		if ( uvs.length > 0 ) data.data.uvs = [ uvs ]; // temporal backward compatibility
		data.data.faces = faces;

		return data;

	},

	clone: function () {

		/*
		 // Handle primitives

		 var parameters = this.parameters;

		 if ( parameters !== undefined ) {

		 var values = [];

		 for ( var key in parameters ) {

		 values.push( parameters[ key ] );

		 }

		 var geometry = Object.create( this.constructor.prototype );
		 this.constructor.apply( geometry, values );
		 return geometry;

		 }

		 return new this.constructor().copy( this );
		 */

		return new Geometry().copy( this );

	},

	copy: function ( source ) {

		var i, il, j, jl, k, kl;

		// reset

		this.vertices = [];
		this.colors = [];
		this.faces = [];
		this.faceVertexUvs = [[]];
		this.morphTargets = [];
		this.morphNormals = [];
		this.skinWeights = [];
		this.skinIndices = [];
		this.lineDistances = [];
		this.boundingBox = null;
		this.boundingSphere = null;

		// name

		this.name = source.name;

		// vertices

		var vertices = source.vertices;

		for ( i = 0, il = vertices.length; i < il; i ++ ) {

			this.vertices.push( vertices[ i ].clone() );

		}

		// colors

		var colors = source.colors;

		for ( i = 0, il = colors.length; i < il; i ++ ) {

			this.colors.push( colors[ i ].clone() );

		}

		// faces

		var faces = source.faces;

		for ( i = 0, il = faces.length; i < il; i ++ ) {

			this.faces.push( faces[ i ].clone() );

		}

		// face vertex uvs

		for ( i = 0, il = source.faceVertexUvs.length; i < il; i ++ ) {

			var faceVertexUvs = source.faceVertexUvs[ i ];

			if ( this.faceVertexUvs[ i ] === undefined ) {

				this.faceVertexUvs[ i ] = [];

			}

			for ( j = 0, jl = faceVertexUvs.length; j < jl; j ++ ) {

				var uvs = faceVertexUvs[ j ], uvsCopy = [];

				for ( k = 0, kl = uvs.length; k < kl; k ++ ) {

					var uv = uvs[ k ];

					uvsCopy.push( uv.clone() );

				}

				this.faceVertexUvs[ i ].push( uvsCopy );

			}

		}

		// morph targets

		var morphTargets = source.morphTargets;

		for ( i = 0, il = morphTargets.length; i < il; i ++ ) {

			var morphTarget = {};
			morphTarget.name = morphTargets[ i ].name;

			// vertices

			if ( morphTargets[ i ].vertices !== undefined ) {

				morphTarget.vertices = [];

				for ( j = 0, jl = morphTargets[ i ].vertices.length; j < jl; j ++ ) {

					morphTarget.vertices.push( morphTargets[ i ].vertices[ j ].clone() );

				}

			}

			// normals

			if ( morphTargets[ i ].normals !== undefined ) {

				morphTarget.normals = [];

				for ( j = 0, jl = morphTargets[ i ].normals.length; j < jl; j ++ ) {

					morphTarget.normals.push( morphTargets[ i ].normals[ j ].clone() );

				}

			}

			this.morphTargets.push( morphTarget );

		}

		// morph normals

		var morphNormals = source.morphNormals;

		for ( i = 0, il = morphNormals.length; i < il; i ++ ) {

			var morphNormal = {};

			// vertex normals

			if ( morphNormals[ i ].vertexNormals !== undefined ) {

				morphNormal.vertexNormals = [];

				for ( j = 0, jl = morphNormals[ i ].vertexNormals.length; j < jl; j ++ ) {

					var srcVertexNormal = morphNormals[ i ].vertexNormals[ j ];
					var destVertexNormal = {};

					destVertexNormal.a = srcVertexNormal.a.clone();
					destVertexNormal.b = srcVertexNormal.b.clone();
					destVertexNormal.c = srcVertexNormal.c.clone();

					morphNormal.vertexNormals.push( destVertexNormal );

				}

			}

			// face normals

			if ( morphNormals[ i ].faceNormals !== undefined ) {

				morphNormal.faceNormals = [];

				for ( j = 0, jl = morphNormals[ i ].faceNormals.length; j < jl; j ++ ) {

					morphNormal.faceNormals.push( morphNormals[ i ].faceNormals[ j ].clone() );

				}

			}

			this.morphNormals.push( morphNormal );

		}

		// skin weights

		var skinWeights = source.skinWeights;

		for ( i = 0, il = skinWeights.length; i < il; i ++ ) {

			this.skinWeights.push( skinWeights[ i ].clone() );

		}

		// skin indices

		var skinIndices = source.skinIndices;

		for ( i = 0, il = skinIndices.length; i < il; i ++ ) {

			this.skinIndices.push( skinIndices[ i ].clone() );

		}

		// line distances

		var lineDistances = source.lineDistances;

		for ( i = 0, il = lineDistances.length; i < il; i ++ ) {

			this.lineDistances.push( lineDistances[ i ] );

		}

		// bounding box

		var boundingBox = source.boundingBox;

		if ( boundingBox !== null ) {

			this.boundingBox = boundingBox.clone();

		}

		// bounding sphere

		var boundingSphere = source.boundingSphere;

		if ( boundingSphere !== null ) {

			this.boundingSphere = boundingSphere.clone();

		}

		// update flags

		this.elementsNeedUpdate = source.elementsNeedUpdate;
		this.verticesNeedUpdate = source.verticesNeedUpdate;
		this.uvsNeedUpdate = source.uvsNeedUpdate;
		this.normalsNeedUpdate = source.normalsNeedUpdate;
		this.colorsNeedUpdate = source.colorsNeedUpdate;
		this.lineDistancesNeedUpdate = source.lineDistancesNeedUpdate;
		this.groupsNeedUpdate = source.groupsNeedUpdate;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

} );


export { Geometry };
