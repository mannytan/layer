// Copyright (c) 2017 Manny Tan
//
//   Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
// limitations under the License.

AFRAME.registerSystem( 'layer', {
	schema: {
		total: { type: 'number', default: 12 },
		ticks: { type: 'number', default: 48 },
	},

	init () {
		console.log( 'system', 'layer', 'init' );
		this.entities = [];
		this.scene = this.el.sceneEl;
		this.isProxyReady = false;
		this.areLayersReady = false;
	},
	update () {
		// setTimeout( () => { this.create3dObjects(); });
		this.create3dObjects();
	},

	/**
	 * Creates all objects
	 */
	create3dObjects: function () {
		console.log( 'system', 'layer', 'create3dObjects' );

		// creates and transforms proxy entity
		this.proxyEl = document.createElement( 'a-entity' );
		this.proxyEl.id = 'proxy';
		this.proxyEl.setAttribute( 'position', { x: 0, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'scale', { x: -2, y: 0.02, z: 2 } );
		this.proxyEl.setAttribute( 'rotation', { x: 90, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'visible', false );
		this.proxyEl.addEventListener( 'object3dset', event => {
			this.isProxyReady = true;
			this.tryMapVertices();
		} );
		let mesh = this.createProxyEntity( this.data.total, this.data.ticks );
		this.proxyEl.setObject3D('obj', mesh );
		this.scene.appendChild( this.proxyEl );

		// creates layers and layer container
		this.layerContainer = document.createElement( 'a-entity' );
		this.layerContainer.id = 'layer-container';
		this.layerContainer.setAttribute( 'position', { x: 0, y: 1.6, z: -3 } );
		this.scene.appendChild( this.layerContainer );
		this.scene.addEventListener( 'layers3dset', event => {
			this.areLayersReady = true;
			this.tryMapVertices();
		} );
		for ( let i = 0; i < this.data.total; i++) {
			this.createLayerEntity( i );
		}
	},

	/**
	 * takes toruses/tori geometry and remaps vertices based on sphere geometry
	 */
	tryMapVertices() {
		if ( !this.isProxyReady ) return;
		if ( !this.areLayersReady ) return;

		this.bakeTransformsOnEntity( this.proxyEl );

		let proxyGeometry = this.proxyEl.getObject3D( 'obj' ).geometry
		let proxyVertices = proxyGeometry.vertices;

		for ( let i = 0; i < this.data.total; i++) {

			let stepOrder = [
				-1 + i,
				 0 + i,
				-1 - i + this.data.total*2,
				 0 - i + this.data.total*2
			];

			let geometry = this.entities[ i ].getObject3D( 'obj' ).geometry
			let vertices = geometry.vertices;

			vertices.forEach( ( vertex, id ) => {
				let tick = parseInt( id / this.data.ticks );
				let seed;
				seed = id % this.data.ticks + stepOrder[tick] * this.data.ticks + 1;

				// required for center layer
				seed = ( stepOrder[tick] === -1 ) ? 0: seed;
				seed = ( stepOrder[tick] === this.data.total * 2 ) ? proxyVertices.length-1: seed;
				vertex.copy( proxyVertices[ seed ] );
			});
			geometry.verticesNeedUpdate = true;

		}
	},

	/**
	 * Removes all transforms from 3dObject and applies it to all vertices
	 * @param el
	 */
	bakeTransformsOnEntity( el ) {

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
	},

	createProxyEntity( total, ticks ) {
		let totalSteps = total * 2 + 1;
		let geometry = new THREE.SphereGeometry( 1, ticks, totalSteps );
		let material = new THREE.MeshPhongMaterial( {
			color: 0x4CC3D9,
			flatShading: true,
			wireframe: true
		} );
		return new THREE.Mesh( geometry, material );
	},

	createLayerEntity( seed ) {
		let el = document.createElement( 'a-entity' );
		el.setAttribute( 'layer', { seed: seed } );
		this.layerContainer.appendChild( el );
	},

	deleteLayerEntity( seed ) {
		let el = this.entities[ seed ];
		el.parentNode.removeChild( el );
	},

	registerMe: function ( el ) {
		this.entities.push( el );
		if( this.entities.length === this.data.total ) {
			this.scene.emit('layers3dset')
		}
	},

	unregisterMe: function ( el ) {
		let index = this.entities.indexOf( el );
		this.entities.splice( index, 1 );
	}

});
