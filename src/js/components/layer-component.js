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
const RED_COLOR = 0x333333;
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

		this.distance = 0;
		this.speed = 0.05;

		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.isFrameReady = true;

		this.el.addEventListener( 'object3dset', event => {
			this.system.registerMe(this.el);
		} );

		// transparent:true,
		// blending: THREE.NormalBlending
		// NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending,
		this.geometry = new THREE.TorusGeometry( 0.5, 0.25, 4, this.system.ticks );
		this.targetGeometry = this.geometry.clone();
		this.material = new THREE.MeshBasicMaterial( {
			color: 0xFFFFFF,
			flatShading: true,
			wireframe: false,
			vertexColors: THREE.FaceColors,
		} );

		this.updateColors( [ BLACK_COLOR, BLACK_COLOR, RED_COLOR, WHITE_COLOR ] );

		this.el.addEventListener( 'object3dset', event => {
			this.torusMesh = this.el.getObject3D( 'obj' );
		} );
		this.el.setObject3D('obj', new THREE.Mesh( this.geometry, this.material ));


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
		this.geometry.verticesNeedUpdate = true;
	},

	/**
	 * transform animations [ 'position', 'scale', 'rotation', 'shift' ]
	 */
	animateTransform( property, to ){
		switch( property ) {
			case 'scale':
			case 'rotation':
				this.animateProperty( property, to );
				break;
			case 'position':
				this.animatePosition( to );
				break;
			case 'shift':
				this.shiftVertices();
				break;
			default :
				console.log( 'property', property );
		}
	},

	/**
 	 * onUpdate is called faster than the current frame rate
	 * onUpdate is throttled with tick to prevent memory lockup
	 */
	animateProperty( property, to ){
		let prop = new THREE.Vector3();
		prop.copy( this.el.getAttribute( property ) );

		let speed = 2000;
		let delay = 4000 * this.normal;

		this.transformTween = new TWEEN.Tween( prop )
			.to( to, speed )
			.delay( delay )
			.easing( TWEEN.Easing.Exponential.InOut )
			.onUpdate( () => {
				if( ! this.isFrameReady ) return;
				this.el.setAttribute( property, prop );
				this.isFrameReady = false;
			} )
			.onComplete( () => {
				this.isFrameReady = false;
				this.el.emit( 'step-complete' );
			})
			.start();
	},

	/**
	 * onUpdate is called faster than the current frame rate
	 * onUpdate is throttled with tick to prevent memory lockup
	 */
	animatePosition( to ){
		let prop = new THREE.Vector3();
		prop.copy( this.torusMesh.position );

		// let speed = 5000;
		// let delay = 0;
		let speed = 2000;
		let delay = 4000 * this.normal;

		this.transformTween = new TWEEN.Tween( prop )
			.to( to, speed )
			.delay( delay )
			.easing( TWEEN.Easing.Exponential.InOut )
			.onUpdate( () => {
				if( ! this.isFrameReady ) return;
				this.torusMesh.position.copy( prop );
				this.isFrameReady = false;
			} )
			.onComplete( () => {
				this.isFrameReady = false;
				this.el.emit( 'step-complete' );
			})
			.start();
	},

	/**
	 * vertices step order is shifted by 1
	 * onUpdate is called faster than the current frame rate
	 * onUpdate is throttled with tick to prevent memory lockup
	 */
	shiftVertices() {
		this.isFlipped = !this.isFlipped;
		this.mapVertices( this.targetGeometry );

		let proxy = { value: 10 }
		this.shiftTween = new TWEEN.Tween( proxy )
			.to( { value: 20 }, 4000 )
			.delay( 500*this.normal )
			.easing( TWEEN.Easing.Exponential.InOut )
			.onUpdate( normal => {
				if( ! this.isFrameReady ) return;

				this.updateVertices( normal );
				this.isFrameReady = false;
			})
			.onComplete( () => {
				this.el.emit( 'step-complete' );
			})
			.start();
	},

	tick() {
		this.isFrameReady = true;
	},

	/**
	 * set colors of each torus
	 * a, b refer to which of the 4 torus sides get colored
	 */

	updateColors( colors ) {
		let faces = this.geometry.faces;
		let totalTicks = this.system.ticks*2;
		for( let i = 0 ; i < (faces.length/4); i++){
			faces[ i + totalTicks * 0 ].color.setHex( colors[0] );
			faces[ i + totalTicks * 1 ].color.setHex( colors[1] );
			faces[ i + totalTicks * 2 ].color.setHex( colors[2] );
			faces[ i + totalTicks * 3 ].color.setHex( colors[3] );
		}
		this.geometry.elementsNeedUpdate = true;
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
