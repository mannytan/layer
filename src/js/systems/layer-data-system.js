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

AFRAME.registerSystem( 'layer-data', {
	schema: {
		total: { type: 'number', default: 128 },
		ticks: { type: 'number', default: 128 },
	},

	init () {
		// console.log( 'layer-data-system', 'init' );
		console.log( 'layer-data-system', 'total:', this.data.total, 'ticks:', this.data.ticks );

		this.entities = [];
		this.scene = this.el.sceneEl;

		// creates and transforms proxy entity
		this.proxyEl = document.createElement( 'a-entity' );
		this.proxyEl.id = 'proxy'
		this.proxyEl.setAttribute( 'position', { x: 0, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'scale', { x: -2, y: 2, z: 2 } );
		this.proxyEl.setAttribute( 'rotation', { x: 90, y: 0, z: 0 } );
		this.proxyEl.setAttribute( 'visible', false );
		this.scene.appendChild( this.proxyEl );

		// creates layer container
		this.layerContainer = document.createElement( 'a-entity' );
		this.layerContainer.id = 'layerContainer';
		this.layerContainer.setAttribute( 'position', { x: 0, y: 1.6, z: -3 } );
		this.layerContainer.setAttribute( 'slow-rotate', { speed: 0.05 } );
		this.scene.appendChild( this.layerContainer );

		for ( let i = 0; i < this.data.total; i++) {
			this.createLayerEntity( i );
		}
	},

	createLayerEntity( seed ) {
		let el = document.createElement( 'a-entity' );
		el.id = 'layer_' + seed;
		if( seed % 2 !== 0 ) {
			el.setAttribute( 'visible', false );
		}
		this.layerContainer.appendChild( el );
	},

	deleteLayerEntity( seed ) {
		let el = this.entities[ seed ];
		el.parentNode.removeChild( el );
	},

});
