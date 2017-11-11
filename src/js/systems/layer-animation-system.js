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
		this.animationCount = 0;

		this.animations = this.createRandomTransforms();

		this.scene.addEventListener( 'layers-ready', event => {

			let layerData = this.scene.systems['layer-data'];
			this.entities = layerData.entities;
			this.total = layerData.data.total;
			this.ticks = layerData.data.ticks;

			this.createAnimations();
		});

	},

	createRandomTransforms() {
		return [
			// { property:'scale', 	to: { x: 1, y: 1, z: 50 }, 		spread: false },
			// { property:'scale', 	to: { x: 1, y: 1, z: 10 }, 		spread: false },

			{ property:'position', 	to: this.getRandomPosition(), 	spread: this.randomBool() },
			{ property:'scale',	 	to: this.getRandomScale(), 		spread: false },
			{ property:'rotation', 	to: this.getRandomRotation(), 	spread: this.randomBool() },
			{ property:'scale', 	to: { x: 1, y: 1, z: 50 }, 		spread: false },
			{ property:'rotation', 	to: { x: 0, y: 0, z: 0 }, 		spread: this.randomBool() },
			{ property:'position', 	to: this.getRandomPosition(), 	spread: this.randomBool() },
			{ property:'scale', 	to: { x: 1, y: 1, z: 1 }, 		spread: false },

			// { property:'position', to: this.getRandomPosition() },
			// { property:'position', to: '0 0 0' },
			// { property:'rotation', to: '0 0 0' },
		];
	},
	getRandomPosition() {
		return {
			x: 0,
			y: 0,
			z: this.randomStep( -2, 2, 0.25 )
		};
		return {
			x: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 ),
			y: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 ),
			z: this.randomBool() ? 0 : this.randomStep( 0, 2, 0.25 )
		};
	},
	getRandomRotation() {
		return {
			x: this.randomStep( -90, 90, 45 ),
			y: this.randomStep( -90, 90, 45 ),
			z: 0
		};
	},
	getRandomScale() {
		return {
			x: this.randomStep( 0.25, 2, 0.25 ),
			y: this.randomStep( 0.25, 2, 0.25 ),
			z: this.randomStep( 10, 50, 25 ),
		};
		return {
			x: this.randomBool() ? 1 : this.randomStep( 0.25, 2, 0.25 ),
			y: this.randomBool() ? 1 : this.randomStep( 0.25, 2, 0.25 ),
			z: this.randomBool() ? 1 : this.randomStep( 1, 50, 25 ),
		};
	},
	createAnimations() {
		this.animationId = 0;
		this.startAnimations(this.animations[this.animationId]);

		this.scene.addEventListener( 'animation-complete', event => {
			this.animationId++;
			if( this.animationId === this.animations.length ) {
				console.log('all animations complete')

				this.entities.forEach( el => {
					el.components[ 'layer' ].shiftVertices();
				} );

				this.animations = this.createRandomTransforms();
				this.animationId = 0;
			}
			this.startAnimations(this.animations[this.animationId]);
		});

	},
	startAnimations( params ) {
		console.log('startAnimations', params.property, params.to, params.spread)
		let speed = 2000;
		let delay = 2000;
		let masterDelay = 1000;//speed + delay;
		let el;
		this.completeCount = 0;
		let to = new THREE.Vector3();
		let from = new THREE.Vector3();

		for ( let i = 0; i < this.total; i++) {
			el = this.entities[i];
			to.copy( params.to );

			if( params.spread ) {
				from.copy( params.to ).negate();
				to.sub(from);
				to.multiplyScalar( i / (this.total-1) );
				to.add(from);
			}

			el.setAttribute( 'animation__'+this.animationCount, {
				dur: speed,
				easing: 'easeInOutElastic',
				loop: false,
				property: params.property,
				delay: delay*i/this.total,
				to: to
			});

			el.addEventListener('animation__' + +this.animationCount + '-complete', (event) => {
				this.completeCount++;
				if( this.completeCount === this.total ) {
					this.scene.emit( 'animation-complete' );
				}
			});
		}
		this.animationCount++;

		/*
		timeCount += masterDelay;

		params = Object.assign({}, defaults);
		params.property = 'position';
		params.delay = timeCount + delay*i/this.total;
		params.to = '0 2 0';
		this.entities[i].setAttribute( 'animation__2', params );

		params = Object.assign({}, defaults);
		params.property = 'rotation';
		params.delay = timeCount + delay*i/this.total;
		params.to = '270 0 0';
		this.entities[i].setAttribute( 'animation__3', params );
		timeCount += masterDelay;

		params = Object.assign({}, defaults);
		params.property = 'position';
		params.delay = timeCount + delay*i/this.total;
		params.to = '0 0 0';
		this.entities[i].setAttribute( 'animation__4', params );

		params = Object.assign({}, defaults);
		params.property = 'rotation';
		params.delay = timeCount + delay*i/this.total;
		params.to = '0 0 0';
		this.entities[i].setAttribute( 'animation__5', params );
		timeCount += masterDelay;
		*/
	}
});
