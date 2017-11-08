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

AFRAME.registerComponent('layer', {
	schema: {
		seed: {type: 'number', default: 0 },
	},

	init () {
		this.normal = this.data.seed / (this.system.data.total);

		this.el.addEventListener( 'object3dset', event => {
			this.system.registerMe(this.el);
		} );

		// let isWireframe = !( this.data.seed % 4 === 0 );
		let geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.data.ticks );
		let material = new THREE.MeshPhongMaterial( { color: 0xEF2D5E, flatShading: true, wireframe: false, transparent:true, blending: THREE.MultiplyBlending } );
		// material.blending = THREE['MultiplyBlending'];
		this.el.setObject3D('obj', new THREE.Mesh( geometry, material ));

		this.x = 0;
		this.y = 0;
		this.z = 0;
	},
	tick() {
		// this.el.setAttribute( 'rotation', {
		// 	x: this.x,
		// 	y: this.y,
		// 	z: this.z,
		// } );
		// this.x += 1 + 1-1*this.normal;
		// this.y += 1 + 1-1*this.normal;
		// this.z += 1 + 1-1*this.normal;
	},
	update () {

		this.el.setAttribute( 'position', {
			x: 0, //this.normal * 4.0 - 2.0,
			y: 0, //1.6,
			z: (this.normal)*2 - 2
		} );
	},

	remove () {
		this.system.unregisterMe(this.el);
	}
});
