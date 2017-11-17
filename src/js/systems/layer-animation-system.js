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

import { MathUtils } from '../utils/math-utils';
import TWEEN from 'tween.js';

AFRAME.registerSystem( 'layer-animation', {
	dependencies: [ 'layer-data' ],

	schema: {

	},

	init () {
		// console.log( 'layer-animation-system', 'init' );
		this.randomInt = MathUtils.randomInt;
		this.randomStep = MathUtils.randomStep;
		this.randomColor = MathUtils.randomColor;
		this.randomBool = MathUtils.randomBool;

		this.scene = this.el.sceneEl;
		this.entities = null;
		this.total = 0;
	},

	update() {
		// console.log( 'layer-animation-system', 'update' );
		this.scene.addEventListener( 'layers-ready', event => {
			let layerData = this.scene.systems['layer-data'];
			this.entities = layerData.entities;
			this.total = layerData.data.total;
			this.ticks = layerData.data.ticks;
			this.proxyEl = document.querySelector( '#proxy' );
			this.addLayerAnimationComponents();
			this.createAnimationManager();
		});
	},

	/**
	 * Creates all objects dynamically
	 */
	addLayerAnimationComponents: function () {
		for ( let i = 0; i < this.total; i++) {
			let el = document.querySelector( '#layer_' + i );
			el.setAttribute( 'layer-animation', { seed: i } );
		}
	},

	createAnimationManager() {
		console.log( 'layer-animation-system', 'createAnimationManager' );
		// event called when all transforms are done
		this.el.addEventListener( 'all-list-transforms-complete', event => {	// console.log( 'all-list-transforms-complete' )
			this.animationId = 0;
			this.completeCount = 0;
			this.animations = this.createTransformList();
			this.animateTransform( this.animations[ this.animationId ] );
		} );

		// event called when all steps are done
		this.el.addEventListener( 'all-steps-complete', event => {				// console.log( 'all-steps-complete' );
			this.completeCount = 0;

			this.animationId++;
			if( this.animationId === this.animations.length ) {
				this.el.emit( 'all-list-transforms-complete' );
			} else {
				this.animateTransform( this.animations[ this.animationId ] );
			}
		} );

		// events called when a step is done
		// step-complete is emited by layer component
		this.entities.forEach( el => {
			el.addEventListener( 'step-complete', (event) => {					// console.log( event.target.id, 'step-complete' )
				this.completeCount++;
				if( this.completeCount === this.total ) {
					this.el.emit( 'all-steps-complete' );
				}
			} );
		} );

		this.animationId = 0;
		this.completeCount = 0;
		this.animations = this.createTransformList();
		this.animateTransform( this.animations[ this.animationId ] );

	},

	/**
	 * adds an animation attribute to all step entities
	 * emits 'all-steps-complete' when all step animations have completed
	 */
	animateTransform( params ) {
		console.log( this.animationId + '/' + this.animations.length, params.property, params.to, params.spread );

		let normal;
		let el;
		let to;
		let from = new THREE.Vector3();

		for ( let i = 0; i < this.total; i++) {
			el = this.entities[i];
			normal = i / (this.total-1);
			from.copy( params.to );
			from.negate();
			to = this.getTargetVector( from , params.to, normal, params.spread );
			el.components['layer-animation'].animateTransform( params.property, to );
		}
	},

	/**
	 * Vector lerp
	 * if spread == true,	returns (b-a)*normal+a
	 * if spread == false, 	returns b
	 */
	getTargetVector( from, to, normal, spread ) {
		let vec = new THREE.Vector3();
		vec.copy( to );
		if( spread ) {
			vec.sub(from);
			// vec.multiplyScalar( this.easeInSine ( normal, 0, 1, 1 ) );
			vec.multiplyScalar( normal );
			vec.add(from);
		}
		return vec;
	},

	// t: current time, b: begInnIng value, c: change In value, d: duration
	// easeInSine ( normal, 0, 1, 1 );
	easeInSine( t, b, c, d ) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine( t, b, c, d ) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	createTransformList() {
		return [
			{ property:'shift',		to: { x: 0, y: 0, z: 0 }, 		spread: false },
			{ property:'rotation', 	to: this.getRandomRotation(), 	spread: true },
			{ property:'position', 	to: this.getRandomPosition(), 	spread: false },
			{ property:'scale',	 	to: this.getRandomScale(), 		spread: false },
			{ property:'position', 	to: { x: 0, y: 0, z: 1 }, 		spread: false },
			{ property:'rotation', 	to: this.getRandomRotation(), 	spread: true },

			{ property:'scale',	 	to: { x: 1, y: 1, z: 1 }, 		spread: false },
			{ property:'rotation', 	to: { x: 0, y: 0, z: 0 }, 		spread: true },
			{ property:'scale', 	to: { x: 1, y: 1, z: 1 }, 		spread: false },

		];
	},

	getRandomPosition() {
		return {
			x: this.randomStep( 1, 4, 0.25 ),
			y: 0,
			z: 0
		};
	},
	getRandomRotation() {
		return {
			x: this.randomStep( -90, 90, 10 ),
			y: this.randomStep( -90, 90, 10 ),
			z: 0
		};
		return {
			x: this.randomStep( -90, 90, 45 ),
			y: this.randomStep( -90, 90, 45 ),
			z: 0
		};
	},
	getRandomScale() {
		return {
			x: this.randomStep( 0.5, 1, 0.05 ),
			y: this.randomStep( 0.5, 1, 0.05 ),
			z: this.randomStep( 0.05, 1, 0.05 ),
		};
	}

});


function tweenUpdate() {
    requestAnimationFrame(tweenUpdate);
    TWEEN.update();
}
tweenUpdate();
