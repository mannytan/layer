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

AFRAME.registerSystem( 'layer-data', {
	schema: {
		total: { type: 'number', default: 24 },
		ticks: { type: 'number', default: 48 },
	},

	init () {
		console.log( 'layer-data-system', 'init' );
		console.log( 'total', this.data.total );
		console.log( 'ticks', this.data.ticks );
		this.entities = [];
		this.scene = this.el.sceneEl;
	},
});
