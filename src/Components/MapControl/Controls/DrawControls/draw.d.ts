declare module 'mapbox-gl-draw-geodesic' {
	import { DrawCustomMode, DrawMode, DrawModes } from '@mapbox/mapbox-gl-draw';

	const enable: (modes: DrawModes) => { [modeKey: string]: DrawCustomMode<unknown, unknown> | DrawMode };
	/*
	class MapboxDrawGeodesic {
		enable(modes: string[]): {[modeKey: string]: DrawCustomMode<unknown, unknown> | DrawMode;}
	}
	export default MapboxDrawGeodesic;*/
}
