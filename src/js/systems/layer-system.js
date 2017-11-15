/**
 * Copyright 2017 Manny Tan
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

AFRAME.registerSystem( 'layer', {
	dependencies: [ 'layer-data' ],

	schema: {

	},

	init () {
		console.log( 'layer-system', 'init' );
		this.scene 	= this.el.sceneEl;

		let layerData = this.scene.systems['layer-data'];
		this.entities = layerData.entities;
		this.total = layerData.data.total;
		this.ticks = layerData.data.ticks;

		this.isProxyReady = false;
		this.areLayersReady = false;
	},
	update () {
		console.log( 'layer-system', 'update' );
		this.create3dObjects();
	},

	/**
	 * Creates all objects dynamically
	 */
	create3dObjects: function () {
		console.log( 'layer-system', 'create3dObjects' );

		// creates and transforms proxy entity
		this.proxyEl = document.createElement( 'a-entity' );
		this.proxyEl.setAttribute( 'position', { x: 0, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'scale', { x: -2, y: 2, z: 2 } );
		this.proxyEl.setAttribute( 'rotation', { x: 90, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'visible', false );
		this.proxyEl.addEventListener( 'object3dset', event => {
			this.isProxyReady = true;
			this.tryMapVertices();
		} );
		let mesh = this.createProxyEntity( this.total, this.ticks );
		this.proxyEl.setObject3D('obj', mesh );
		this.scene.appendChild( this.proxyEl );

		// creates layer container
		this.layerContainer = document.createElement( 'a-entity' );
		this.layerContainer.setAttribute( 'position', { x: 0, y: 1.6, z: -6 } );
		this.layerContainer.setAttribute( 'slow-rotate', { speed: 0.05 } );
		this.scene.appendChild( this.layerContainer );

		// creates layers
		this.scene.addEventListener( 'layers3dset', event => {
			this.bakeTransformsOnEntity( this.proxyEl );
			this.morphSphereVertices();
			this.areLayersReady = true;
			this.tryMapVertices();
		} );
		for ( let i = 0; i < this.total; i++) {
			this.createLayerEntity( i );
		}
	},

	morphSphereVertices( ) {
		let proxyGeometry = this.proxyEl.getObject3D( 'obj' ).geometry
		let proxyVertices = proxyGeometry.vertices;

		let normal = 0.5;

		let min = 1000;
		let max = -1000
		proxyVertices.forEach( vertex => {
			min =  ( vertex.y < min ) ? vertex.y : min;
			max =  ( vertex.y > max ) ? vertex.y : max;
		});
		proxyVertices.forEach( ( vertex, seed ) => {
			// vertex.z += 0.1;
			vertex.z *= ( vertex.y + 2 ) / ( max + 2 );
			// console.log(seed, vertex.y/max)
		});
		proxyGeometry.elementsNeedUpdate = true;

	},

	/**
	 * takes toruses/tori geometry and remaps vertices based on sphere geometry
	 */
	tryMapVertices() {

		if ( !this.isProxyReady ) return;
		if ( !this.areLayersReady ) return;
		console.log( 'layer-system', 'tryMapVertices' );

		let proxyGeometry = this.proxyEl.getObject3D( 'obj' ).geometry
		let proxyVertices = proxyGeometry.vertices;
		let layerComponent;
		for ( let i = 0; i < this.total; i++) {
			layerComponent = this.entities[ i ].components[ 'layer' ];
			layerComponent.mapVertices( layerComponent.geometry );
		}
		this.scene.emit( 'layers-ready' );
	},

	/**
	 * Removes all transforms from 3dObject and applies it to all vertices
	 * @param el
	 */
	bakeTransformsOnEntity( el ) {
		console.log( 'layer-system', 'bakeTransformsOnEntity' );

		let mesh = el.object3D;
		mesh.updateMatrix();
		mesh.updateMatrixWorld( true );

		let vertices = el.getObject3D( 'obj' ).geometry.vertices;
		vertices.forEach( vertex => {
			vertex.applyMatrix4( mesh.matrixWorld );
		});

		el.removeAttribute( 'scale' );
		el.removeAttribute( 'rotation' );
		el.removeAttribute( 'position' );

		// vertices[37].z += 3;
		// el.getObject3D( 'obj' ).geometry.elementsNeedUpdate = true;

	},

	createProxyEntity( total, ticks ) {
		let totalSteps = total * 2;
		let geometry = new THREE.SphereGeometry( 1, ticks, totalSteps );
		let material = new THREE.MeshPhongMaterial( {
			color: 0x000000,
			flatShading: true,
			wireframe: true
		} );
		return new THREE.Mesh( geometry, material );
	},

	createLayerEntity( seed ) {
		let el = document.createElement( 'a-entity' );
		el.id = seed;
		el.setAttribute( 'layer', { seed: seed } );
		this.layerContainer.appendChild( el );
	},

	deleteLayerEntity( seed ) {
		let el = this.entities[ seed ];
		el.parentNode.removeChild( el );
	},

	registerMe: function ( el ) {
		this.entities.push( el );
		if( this.entities.length === this.total ) {
			this.scene.emit('layers3dset')
		}
	},

	unregisterMe: function ( el ) {
		let index = this.entities.indexOf( el );
		this.entities.splice( index, 1 );
	}

});
