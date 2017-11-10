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
const SIDES_COLOR = 0xEEEEEE;
AFRAME.registerComponent('layer', {
	dependencies: [ 'layer-data' ],

	schema: {
		seed: {type: 'number', default: 0 },
	},

	init () {
		// console.log( 'layer-component', 'init', this.data.seed );
		this.normal = this.data.seed / (this.system.total);

		this.el.addEventListener( 'object3dset', event => {
			this.system.registerMe(this.el);
		} );

		this.geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.ticks );
		this.material = new THREE.MeshBasicMaterial( {
			color: 0xFFFFFF,
			flatShading: true,
			wireframe: false,
			vertexColors: THREE.FaceColors,
			transparent:true,
			// opacity: 0.75,
			// blending: this.data.seed%2 === 1 ? THREE.MultiplyBlending : THREE.NormalBlending
			blending: THREE.NormalBlending
		} );

		// NoBlending,
		// NormalBlending,
		// AdditiveBlending,
		// SubtractiveBlending,
		// MultiplyBlending,

		this.updateFrontColors( FRONT_COLOR );
		this.updateSideColors( SIDES_COLOR );
		this.updateOutermostSideColor();

		this.el.setObject3D('obj', new THREE.Mesh( this.geometry, this.material ));

		this.x = 0;
		this.y = 0;
		this.z = 0;
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

	updateFrontColors( color ) {
		this.updateColors( 0, 2, color );
	},

	updateSideColors( color ) {
		this.updateColors( 1, 3, color );
	},

	// set outermost band
	updateOutermostSideColor() {
		let faces = this.geometry.faces;
		let totalTicks = this.system.ticks*2;
		if ( this.data.seed === this.system.total - 1 ){
			for( let i = 0 ; i < (faces.length/4); i++){
				faces[ i + totalTicks*1 ].color.setHex( FRONT_COLOR );
			}
		}
		this.geometry.elementsNeedUpdate = true;
	},

	update () {
		this.el.setAttribute( 'position', {
			x: 0,
			y: 0,
			z: 0
		} );
	},

	remove () {
		this.system.unregisterMe(this.el);
	}
});
