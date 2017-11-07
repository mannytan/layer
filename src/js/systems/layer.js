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

// system

AFRAME.registerSystem( 'layer', {
	schema: {
		total: { type: 'number', default: 1 },
		ticks: { type: 'number', default: 12 },
	},

	init: function () {
		console.log( 'system', 'layer', 'init' );
		this.entities = [];
		this.scene = this.el.sceneEl;



		// deleting
		// needs to removed from the bottom up
		// setTimeout( () => {
		// 	for ( let i = 0; i < this.data.total; i++) {
		// 		let seed = ( this.data.total - 1 ) - i;
		// 		this.deleteLayerEntity( seed );
		// 	}
		// }, 2000);

	},

	update: function () {
		console.log( 'system', 'layer', 'update' );

		this.proxyEl = document.createElement( 'a-entity' );
		this.proxyEl.id = 'proxy';
		this.scene.appendChild( this.proxyEl );

		let sphere = this.createProxy( { steps:7, ticks:this.data.ticks } );
		this.proxyEl.setObject3D('obj', sphere);

		let next = () => { return new Promise( resolve => { setTimeout( resolve ) }) }
		next().then( () => {

			this.proxyEl.setAttribute( 'position', { x : 0, y : 0, z : 0 } );
			this.proxyEl.setAttribute( 'scale', { x : -2, y : 0.25, z : 2 } );
			this.proxyEl.setAttribute( 'rotation', { x : 90, y : 0, z : 0 } );

			this.bakeTransformsOnProxy();

			return next();
		}).then( () => {

			let geometry = this.proxyEl.getObject3D( 'obj' ).geometry
			let vertices = geometry.vertices;
			console.log( 'vertices.length', vertices.length );
			// vertices[3].z+=0.5;
			// geometry.verticesNeedUpdate = true;

			// creating test
			// created top down
			for ( let i = 0; i < this.data.total; i++) {
				this.createLayerEntity( i );
			}

			return next();

		}).then( () => {

			let proxyGeometry = this.proxyEl.getObject3D( 'obj' ).geometry
			let proxyVertices = proxyGeometry.vertices;

			let geometry = this.entities[ 0 ].getObject3D( 'obj' ).geometry
			let vertices = geometry.vertices;

			console.log( 'vertices.length', vertices.length );
			vertices[0].copy( proxyVertices[ 0 ] );

			// vertices.forEach( ( vertex, i ) => {
			// 	let seed = i + 2*this.data.ticks + 1;
			// 	vertex.copy( proxyVertices[ seed ] );
			// });
			// let order = [
			// 	[ 0, 1, 6, 7 ],
			// 	[ 1, 2, 5, 6 ],
			// 	[ 2, 3, 4, 5 ],
			// ];
			let order;
			// order = [ 0, 1, 6, 7 ];
			// order = [ -1, 0, 7, -2 ];
			// order = [ 1, 2, 5, 6 ];
			order = [ 2, 3, 4, 5 ];
			vertices.forEach( ( vertex, i ) => {
				let x = parseInt( i / this.data.ticks );
				let seed;
				seed = i%this.data.ticks + order[x]*this.data.ticks + 1;
				seed = ( order[x] === -1 ) ? 0 : seed;
				seed = ( order[x] === -2 ) ? proxyVertices.length-1 : seed;


				vertex.copy( proxyVertices[ seed ] );
			});


			geometry.verticesNeedUpdate = true;

			console.log( geometry );


			return next();
		});

	},

	createProxy( obj ) {
		let geometry = new THREE.SphereGeometry( 1, this.data.ticks, 9 );
		let material = new THREE.MeshPhongMaterial( {
			color: 0x4CC3D9,
			flatShading: true,
			wireframe: true
		} );
		return new THREE.Mesh( geometry, material );
	},

	bakeTransformsOnProxy() {

		let mesh = this.proxyEl.object3D;
		mesh.updateMatrix();
		mesh.updateMatrixWorld( true );

		let proxyVertices = this.proxyEl.getObject3D( 'obj' ).geometry.vertices;
		proxyVertices.forEach( vertex => {
			vertex.applyMatrix4( mesh.matrixWorld );
		});

		this.proxyEl.removeAttribute( 'scale' );
		this.proxyEl.removeAttribute( 'rotation' );
		this.proxyEl.removeAttribute( 'position' );
	},

	createLayerEntity( seed ) {
		let el = document.createElement( 'a-entity' );
		el.setAttribute( 'layer', { seed : seed } );
		this.scene.appendChild( el );
	},

	deleteLayerEntity( seed ) {
		let el = this.entities[ seed ];
		el.parentNode.removeChild( el );
	},

	registerMe: function ( el ) {
		this.entities.push( el );
	},

	unregisterMe: function ( el ) {
		let index = this.entities.indexOf( el );
		this.entities.splice( index, 1 );
	}

});

// component
AFRAME.registerComponent('layer', {
	schema: {
		seed: {type: 'number', default: 0 },
	},

	init: function () {
		this.normal = this.data.seed / (this.system.data.total-1);
		console.log('components','layer', 'init', this.data.seed, this.normal);
		this.system.registerMe(this.el);

		let geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.data.ticks );
		let material = new THREE.MeshPhongMaterial( { color: 0xEF2D5E, flatShading: true, wireframe: true } );
		let torus = new THREE.Mesh( geometry, material );

		this.el.setObject3D('obj', torus);
	},

	update: function () {

		// this.el.setAttribute( 'geometry', {
		// 	primitive : 'box',
		// 	width : 0.025,
		// 	height : 0.025,
		// 	depth : 0.025
		// } );

		this.el.setAttribute( 'position', {
			x : 0,//this.normal * 4.0 - 2.0,
			y : 0,//1.6,
			z : 0,//-2
		} );
	},

	remove: function () {
		console.log('layer', 'remove', this.data.seed);
		this.system.unregisterMe(this.el);
	}
});
