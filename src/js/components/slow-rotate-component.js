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

AFRAME.registerComponent('slow-rotate', {
	schema: {
		speed: { type: 'number', default: 1 },
		axis: { type: 'string', default: 'Y' },
	},

	init () {
		this.x = 0;
		this.y = 0;
	},

	tick() {
		this.el.setAttribute( 'rotation', {
			// x: this.x,
			y: this.y,
		} );
		// this.x += this.data.speed;
		this.y += this.data.speed;
	}

});
