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

// import MathUtils from '../utils/math-utils';
import { MathUtils } from '../utils/math-utils';

AFRAME.registerSystem( 'layer-animation', {
	dependencies: [ 'layer-data' ],

	schema: {

	},

	init () {
		console.log( 'layer-animation-system', 'init' );

		this.randomRange = MathUtils.randomIntFromInterval;
		this.getRandomColor = MathUtils.getRandomColor;
		this.scene = this.el.sceneEl;
		this.entities = null;
		this.total = 0;
		this.animationCount = 0;

		this.animations = [
			{ property:'position', to: this.getRandomPositionString() },
			{ property:'rotation', to: this.getRandomRotationString() },
			{ property:'scale', to: '1 1 100' },
			{ property:'rotation', to: this.getRandomRotationString() },

			{ property:'scale', to: '1 1 1' },
			// { property:'position', to: this.getRandomPositionString() },
			// { property:'position', to: '0 0 0' },
			// { property:'rotation', to: '0 0 0' },
		];


		this.scene.addEventListener( 'layers-ready', event => {

			let layerData = this.scene.systems['layer-data'];
			this.entities = layerData.entities;
			this.total = layerData.data.total;
			this.ticks = layerData.data.ticks;

			this.createAnimations();
		});

	},
	getRandomPositionString() {
		var pos = [
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -2, 2 ),
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -2, 2 ),
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -2, 2 )
		];
		return pos.join(" ");
	},
	getRandomRotationString() {
		var angles = [
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -4, 4 ) * 90,
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -4, 4 ) * 90,
			( this.randomRange(0,1) === 0) ? 0 : this.randomRange( -4, 4 ) * 90
		];
		return angles.join(" ");
	},
	createAnimations() {
		this.animationId = 0;
		this.startAnimations(this.animations[this.animationId]);

		this.scene.addEventListener( 'animation-complete', event => {
			this.animationId++;
			if( this.animationId === this.animations.length ) {
				console.log('all animations complete')
				this.animationId = 1;
			}
			this.startAnimations(this.animations[this.animationId]);
		});

	},
	startAnimations( params ) {
		console.log('startAnimations')
		let speed = 1000;
		let delay = 2000;
		let masterDelay = 1000;//speed + delay;
		let el;
		this.completeCount = 0;
		for ( let i = 0; i < this.total; i++) {
			el = this.entities[i];
			el.setAttribute( 'animation__'+this.animationCount, {
				dur: speed,
				easing: 'easeInOutSine',
				loop: false,
				property: params.property,
				delay: delay*i/this.total,
				to: params.to
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
