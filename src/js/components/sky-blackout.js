// Copyright 2017 Google Inc.
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

const R = 6000 * 2;
const BLACKOUT_SKY_GEO = new THREE.SphereBufferGeometry( 6000, 64, 20 );

const SkyShader = require( '../shaders/sky-shader' );

if ( typeof AFRAME !== 'undefined' && AFRAME ) {
	// AFRAME.registerComponent( 'sky-blackout', {

	// 	dependencies: [ 'visible' ],

	// 	init: function() {
	// 		this.material = new THREE.ShaderMaterial({
	// 			uniforms: THREE.UniformsUtils.clone( SkyShader.uniforms ),
	// 			vertexShader: SkyShader.vertexShader,
	// 			fragmentShader: SkyShader.fragmentShader,
	// 			side: THREE.DoubleSide,
	// 			fog: false
	// 		});

	// 		this.material.uniforms.startColor.value = new THREE.Color( 0x35312E ); 
	// 		this.material.uniforms.endColor.value = new THREE.Color( 0x141312 );
	// 		this.material.uniforms.animIn.value = 1;
	// 		this.material.needsUpdate = true;

	// 		this.mesh = new THREE.Mesh( BLACKOUT_SKY_GEO, this.material );
	// 		this.el.setObject3D( 'mesh', this.mesh );
	// 	}
	// });
}