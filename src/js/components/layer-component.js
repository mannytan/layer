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

const FRONT_COLOR = 0x111111;
const RED_COLOR = 0xEE1111;
const SIDES_COLOR = 0xEEEEEE;
AFRAME.registerComponent('layer', {
	dependencies: [ 'layer-data' ],

	schema: {
		seed: {type: 'number', default: 0 },
	},

	init () {
		// console.log( 'layer-component', 'init', this.data.seed );
		this.normal = this.data.seed / (this.system.total);
		this.isFlipped = false;
		this.el.addEventListener( 'object3dset', event => {
			this.system.registerMe(this.el);
		} );

		// transparent:true,
		// blending: THREE.NormalBlending
		// NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending,
		this.geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.ticks );
		this.material = new THREE.MeshBasicMaterial( {
			color: 0xFFFFFF,
			flatShading: true,
			wireframe: false,
			vertexColors: THREE.FaceColors,
		} );

		this.updateFrontColors( FRONT_COLOR );
		this.updateSideColors( SIDES_COLOR );

		this.el.setObject3D('obj', new THREE.Mesh( this.geometry, this.material ));

		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.targetGeometry = this.geometry.clone();
	},

	flipVertices() {
		console.log('flipVertices')
		this.isFlipped = !this.isFlipped;
		this.mapVertices( this.geometry );
	},

	/**
	 * takes toruses/tori geometry and remaps vertices based on sphere geometry
	 */
	mapVertices( geometry ) {
		let proxyGeometry = this.system.proxyEl.getObject3D( 'obj' ).geometry
		let proxyVertices = proxyGeometry.vertices;
		let stepOrder = [
			-1 + this.data.seed,
			 0 + this.data.seed,
			-2 - this.data.seed + this.system.total * 2,
			-1 - this.data.seed + this.system.total * 2,
		];
		if ( this.isFlipped ) {
			let first = stepOrder.shift();
			stepOrder.push(first);
		}
		let vertices = geometry.vertices;
		vertices.forEach( ( vertex, id ) => {
			let tick = parseInt( id / this.system.ticks );
			let seed;
			seed = id % this.system.ticks + stepOrder[tick] * this.system.ticks + 1;
			seed = ( stepOrder[tick] === -1 ) ? 0: seed;
			seed = ( stepOrder[tick] === this.system.total * 2 - 1 ) ? proxyVertices.length-1: seed;
			vertex.copy( proxyVertices[ seed ] );
		});
		geometry.verticesNeedUpdate = true;

	},

	updateFrontColors( color ) {
		this.updateColors( 0, 2, color );
	},

	updateSideColors( color ) {
		this.updateColors( 1, 3, color );
	},

	updateColors( a, b, color ) {
		let faces = this.geometry.faces;
		let totalTicks = this.system.ticks*2;
		for( let i = 0 ; i < (faces.length/4); i++){
			faces[ i + totalTicks * a ].color.setHex( color );
			faces[ i + totalTicks * b ].color.setHex( color );
		}
		this.geometry.elementsNeedUpdate = true;
	},

	remove () {
		this.system.unregisterMe(this.el);
	}
});
