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
		console.log( 'layer-animation-system', 'init' );

		this.randomInt = MathUtils.randomInt;
		this.randomStep = MathUtils.randomStep;
		this.randomColor = MathUtils.randomColor;
		this.randomBool = MathUtils.randomBool;

		this.scene = this.el.sceneEl;
		this.entities = null;
		this.total = 0;

		this.toggleStyle = 0;

		this.scene.addEventListener( 'layers-ready', event => {

			let layerData = this.scene.systems['layer-data'];
			this.entities = layerData.entities;
			this.total = layerData.data.total;
			this.ticks = layerData.data.ticks;

			this.createAnimationManager();
		});

	},

	createAnimationManager() {
		// event called when all transforms are done
		this.el.addEventListener( 'all-list-transforms-complete', event => {	// console.log( 'all-list-transforms-complete' )
			this.animationId = 0;
			this.completeCount = 0;
			this.animations = this.createTransformList();
			this.animateTransform( this.animations[ this.animationId ] );
		} );

		// event called when all steps are done
		this.el.addEventListener( 'all-steps-complete', event => {
			// console.log( 'all-steps-complete' );
			this.completeCount = 0;

			if ( (this.toggleStyle++%2) === 0 ) {
				this.shiftVertices();
			} else {
				this.animationId++;
				if( this.animationId === this.animations.length ) {
					this.el.emit( 'all-list-transforms-complete' );
				} else {
					this.animateTransform( this.animations[ this.animationId ] );
				}
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

		this.animationId = 1;
		this.completeCount = 0;
		this.animations = this.createTransformList();
		this.animateTransform( this.animations[ this.animationId ] );

	},

	shiftVertices() {
		console.log( 'shiftVertices', this.animationId + '/' + this.animations.length );
		this.entities.forEach( el => {
			el.components[ 'layer' ].shiftVertices();
		} );
	},

	/**
	 * adds an animation attribute to all step entities
	 * emits 'all-steps-complete' when all step animations have completed
	 */
	animateTransform( params ) {
		console.log( 'animateTransform', this.animationId + '/' + this.animations.length, params.property, params.to, params.spread );
		let normal;
		let el;
		let to;
		let from = new THREE.Vector3();

		for ( let i = 0; i < this.total; i++) {
			el = this.entities[i];
			normal = i / (this.total-1);
			to = this.getTargetVector( from , params.to, normal, params.spread);
			el.components['layer'].animateTransform( params.property, to );
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
			vec.multiplyScalar( normal );
			vec.add(from);
		}
		return vec;
	},

	createTransformList() {
		return [
			// { property:'position', 	to: this.getRandomPosition(), 	spread: true },
			{ property:'scale', 	to: { x: 1, y: 1, z: 1 }, 		spread: false },
			{ property:'position', 	to: this.getRandomPosition(), 		spread: true },
			{ property:'rotation', 	to: this.getRandomRotation(), 	spread: true },
			{ property:'scale',	 	to: this.getRandomScale(), 		spread: false },
			{ property:'position', 	to: { x: 0, y: 0, z: 0 }, 		spread: false },
			{ property:'rotation', 	to: { x: 0, y: 0, z: 0 }, 		spread: true },
			{ property:'scale',	 	to: this.getRandomScale(), 		spread: false },
			{ property:'scale', 	to: { x: 1, y: 1, z: 2 }, 		spread: false },
			// { property:'rotation', 	to: this.getRandomRotation(), 	spread: this.randomBool() },

			// // { property:'rotation', 	to: this.getRandomRotation(), 	spread: this.randomBool() },
			// { property:'scale', 	to: { x: 1, y: 1, z: 50 }, 		spread: false },
			// // { property:'rotation', 	to: { x: 0, y: 0, z: 0 }, 		spread: this.randomBool() },
			// { property:'position', 	to: this.getRandomPosition(), 	spread: this.randomBool() },
			// { property:'scale', 	to: { x: 1, y: 1, z: 1 }, 		spread: false },

			// { property:'position', to: this.getRandomPosition() },
			// { property:'position', to: '0 0 0' },
			// { property:'rotation', to: '0 0 0' },
		];
	},

	getRandomPosition() {
		return {
			x: 0,
			y: 0,
			z: this.randomStep( 3, 4, 0.5 )
		};
		return {
			x: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 ),
			y: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 ),
			z: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 )
		};
	},
	getRandomRotation() {
		return {
			x: 0,
			y: 0,
			z: this.randomStep( -180, 180, 10 )
		};
		return {
			x: this.randomStep( -90, 90, 45 ),
			y: this.randomStep( -90, 90, 45 ),
			z: 0
		};
	},
	getRandomScale() {
		return {
			x: 1,
			y: 1,
			z: this.randomStep( 0.1, 2, 0.1 ),
		};
		return {
			x: this.randomBool() ? 1 : this.randomStep( 0.25, 2, 0.25 ),
			y: this.randomBool() ? 1 : this.randomStep( 0.25, 2, 0.25 ),
			z: this.randomBool() ? 1 : this.randomStep( 1, 50, 25 ),
		};
	}

});


function tweenUpdate() {
    requestAnimationFrame(tweenUpdate);
    TWEEN.update();
}
tweenUpdate();
