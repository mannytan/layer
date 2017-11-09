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
	dependencies: [ 'layer-data' ],

	schema: {
		seed: {type: 'number', default: 0 },
	},

	init () {
		console.log( 'layer-component', 'init', this.data.seed );
		this.normal = this.data.seed / (this.system.total);

		this.el.addEventListener( 'object3dset', event => {
			this.system.registerMe(this.el);
		} );

		let geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.ticks );
		let material = new THREE.MeshPhongMaterial( { color: 0xEF2D5E, flatShading: true, wireframe: false, transparent:true, blending: THREE.MultiplyBlending } );
		this.el.setObject3D('obj', new THREE.Mesh( geometry, material ));

		this.x = 0;
		this.y = 0;
		this.z = 0;
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
