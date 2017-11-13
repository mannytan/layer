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

const BLACK_COLOR = 0x111111;
const RED_COLOR = 0xEE1111;
const WHITE_COLOR = 0xEEEEEE;

import TWEEN from 'tween.js';

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

		this.updateFrontColors( BLACK_COLOR );
		this.updateSideColors( WHITE_COLOR );
		this.el.setObject3D('obj', new THREE.Mesh( this.geometry, this.material ));

		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.targetGeometry = this.geometry.clone();
	},

	/**
	 * creates order of torus geometry vertices
	 * based on sphere geometry's step order
	 * below is an example of 3 step order

	 * cross section of a single sphere tick	* winding order rectangle defined by sphere
	 * 0 ------- 6  <- inner most id			* [ 0, 1, 5, 6 ]
	 *  1 ----- 5								* [ 1, 2, 4, 5 ]
	 *   2 -- 4									* [ 2, 3, 3, 4 ]
	 * 	   33  <- outer most id
	 */
	getStepOrder () {
		const doubled = this.system.total * 2;
		let stepOrder = [
			this.data.seed + 0,
			this.data.seed + 1,
			doubled - this.data.seed - 1,
			doubled - this.data.seed - 0,
		];

		if ( this.isFlipped ) {
			let first = stepOrder.shift();
			stepOrder.push(first);
		}

		return stepOrder;
	},

	/**
	 * takes toruses/tori geometry and remaps vertices based on sphere geometry
	 */
	mapVertices( geometry ) {
		let proxyGeometry = this.system.proxyEl.getObject3D( 'obj' ).geometry
		let proxyVertices = proxyGeometry.vertices;

		const firstProxyVertex = 0;
		const lastProxyVertex = proxyVertices.length-1;
		const doubled = this.system.total * 2;

		let vertices = geometry.vertices;
		let stepOrder = this.getStepOrder();

		vertices.forEach( ( vertex, id ) => {
			let tick = parseInt( id / this.system.ticks );
			let seed = 1; 											// offset for first sphere vertice
			seed += id % this.system.ticks;							// actual tick position
			seed += this.system.ticks * ( stepOrder[ tick ] - 1 ); 	// ticks step order

			// account for innermost vertices
			seed = ( stepOrder[ tick ] === 0 ) ? firstProxyVertex : seed; // center vertice
			seed = ( stepOrder[ tick ] === doubled  ) ? lastProxyVertex : seed;

			vertex.copy( proxyVertices[ seed ] );
		});
		geometry.verticesNeedUpdate = true;

	},

	/**
	 * vertices step order is shifted by 1
	 */
	shiftVertices() {
		console.log('shiftVertices')
		this.isFlipped = !this.isFlipped;
		this.mapVertices( this.targetGeometry );
		// this.mapVertices( this.geometry );

		let opacity = { value: 10 }
		this.opacityTween = new TWEEN.Tween( opacity )
			.to( { value: 20 }, 2500 )
			.delay( 2500*this.normal )
			.easing( TWEEN.Easing.Cubic.InOut )
			.onUpdate( normal => {
				this.updateVertices( normal )
			})
			.onComplete( () => {
				// console.log( 'complete' )
				// this.scene.emit( 'animation-complete' );
				// this.mapVertices( this.geometry );
			})
			.start();
	},

	updateVertices( normal ) {

		let targetVertices = this.targetGeometry.vertices;
		let vertices = this.geometry.vertices;
		let total = vertices.length;
		let vert = new THREE.Vector3();
		for( let i = 0 ; i < total; i++){
			vert.subVectors( this.targetGeometry.vertices[i], this.geometry.vertices[i] );
			vert.multiplyScalar( normal );
			vert.add( this.geometry.vertices[i] );
			this.geometry.vertices[i].copy( vert );
		}
		this.geometry.elementsNeedUpdate = true;
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

	/**
	 * set colors of each torus
	 * a, b refer to which of the 4 torus sides get colored
	 */
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
	tick() {
		this.el.setAttribute('rotation', {
			z: this.z
		});
		let speed = 0.25;
		this.z += speed*(1-this.normal);
	},
	remove () {
		this.system.unregisterMe(this.el);
	}
});

function tweenUpdate() {
    requestAnimationFrame(tweenUpdate);
    TWEEN.update();
}
tweenUpdate();
