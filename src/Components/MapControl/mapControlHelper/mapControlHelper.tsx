import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { getGeoInfo } from '../../../Api/backendServices';
import { ILatLng, TSettingsMapLayer, TSettingsMapTilesets, INotamReturnZones } from '@naviair-utm/node-shared-interfaces';
import { addZLayers } from '../MapControl';

/**
 * Get all clickable layers/tiles.
 */
export const getClickableLayers = (tilesets: TSettingsMapTilesets): string[] => {
	const layersArr: string[] = ['notam-active', 'notam-awareness', 'notam-disabled', 'notam-inactive']; //better;
	Object.keys(tilesets).map((tilesetKey) => {
		Object.keys(tilesets[tilesetKey]).map((tilesetTypeKey) => {
			const curLayer = tilesets[tilesetKey][tilesetTypeKey];
			if (curLayer.clickable == undefined || curLayer.clickable) {
				layersArr.push(curLayer.id);
			}
		});
	});
	return layersArr;
};

/**
 * Handle screen responsiveness.
 * @param landscapeState Set landScape view
 * @param mapContainer The current mapContainer
 */
export const mapScreenResponsive = (landscapeState: boolean, mapContainer: React.RefObject<HTMLDivElement>): void => {
	const curControlBottomRight = mapContainer.current?.getElementsByClassName('mapboxgl-ctrl-bottom-right');
	const curControlTopLeft = mapContainer.current?.getElementsByClassName('mapboxgl-ctrl-top-left');
	if (curControlBottomRight && curControlBottomRight.length > 0 && curControlTopLeft && curControlTopLeft.length > 0) {
		if (landscapeState) {
			curControlBottomRight[0].classList.add('hidden');
			curControlTopLeft[0].classList.remove('hidden');
		} else {
			curControlBottomRight[0].classList.remove('hidden');
			curControlTopLeft[0].classList.add('hidden');
		}
	}
};

/**
 * Add a marker to the map.
 * @param map The current map component.
 * @param latLng Coordinates of the marker.
 * @param layersArr Layers under the new marker.
 * @param lang Language(TODO: definition?)
 * @param infoboxState Show state of Infobox.
 */
let clickMarker: mapboxgl.Marker;
let clickLock = false;
export const addMarker = async (map: mapboxgl.Map, latLng: ILatLng, layersArr: string[], lang?: string): void => {
	if (!clickLock) {
		try {
			clickLock = true;
			clickMarker && clickMarker.remove();
			clickMarker = new mapboxgl.Marker({ color: '#333' }).setLngLat([latLng.long, latLng.lat]).addTo(map);

			//Get screen point from lngLat
			const point = map.project([latLng.long, latLng.lat]);

			//Filter all dynamic added layers
			const features = await map.queryRenderedFeatures(point, { layers: layersArr });

			//Get geo info from lat/long
			const geoInfo = await getGeoInfo(latLng.lat, latLng.long, lang);

			//Fire event
			map.fire('markerAdded', {
				geoInfo: geoInfo,
				features: removeDuplicateFeatures(features),
				latLng: latLng,
			});
		} catch (error) {
			clickMarker && clickMarker.remove();
			clickLock = false;
		} finally {
			clickLock = false;
		}
	}
};

/**
 * Set the active tiles layer to show on map in right colors
 * @param map The current map component.
 * @param layers Layers under the new marker.
 * @param tileSets	Settings/props for the particular tilesets.
 * @param activeLayer Set layer activity state.
 */
export const setLayer = (map: mapboxgl.Map, layers: TSettingsMapLayer[], tilesets: TSettingsMapTilesets, activeLayer: number): void => {
	layers[activeLayer].tilesetGroups.forEach((layer) => {
		if (layer.tilesets) {
			layer.tilesets.forEach(({ id: tilesetKey, toggleable }) => {
				//notam handled elsewhere as clickableLayer
				if (['notam-active', 'notam-awareness', 'notam-disabled', 'notam-inactive'].includes(tilesetKey)) {
					return;
				}
				Object.keys(tilesets[tilesetKey]).forEach((tilesetTypeKey) => {
					const { id, visible, fill, layerType } = tilesets[tilesetKey][tilesetTypeKey];
					const showLayer = visible !== undefined && !visible ? false : true;
					if (layerType === 'line') {
						if (showLayer) map.setPaintProperty(id, 'line-color', `rgba(${layer.color},1)`);
						// eslint-disable-next-line @typescript-eslint/naming-convention
					} else {
						if ((fill === undefined || fill) && (layer.fill === undefined || layer.fill)) {
							map.setPaintProperty(id, 'fill-color', `rgba(${layer.color},${showLayer ? '0.4' : '0.0'})`);
						}
						if (showLayer) map.setPaintProperty(id, 'fill-outline-color', `rgba(${layer.color},1)`);
					}
					const mapboxLayer = map.getLayer(id) as mapboxgl.FillLayer | mapboxgl.LineLayer;
					// eslint-disable-next-line @typescript-eslint/naming-convention
					mapboxLayer.metadata = { ...mapboxLayer.metadata, toggleable, _id: tilesetKey };
				});
			});
		}
	});
};

/**
 * Color definition for notam layers.
 */
const notamColors: { [key: string]: { color: string; fill: boolean } } = {
	active: { color: '211,94,96', fill: true },
	inactive: { color: '255,204,0', fill: true },
	awareness: { color: '225,151,76', fill: true },
	disabled: { color: '255,204,0', fill: false },
};

/**
 * Consruct the notam layer, and assign colors.
 * @param map Current map component
 * @param key Key to fetch the color for notam later
 * @param fill	If layer should be filled, or fully transparent
 */
const constructNotam = (map: mapboxgl.Map, key: string, fill: boolean) => {
	addZLayers(map);
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	!map.getLayer(`notam-${key}`) &&
		map.addLayer(
			{
				id: `notam-${key}`,
				type: 'fill',
				source: `notam-${key}`,
				layout: {
					'fill-sort-key': 2,
				},
				paint: fill
					? { 'fill-color': `rgba(${notamColors[key].color},0.4'})`, 'fill-outline-color': `rgba(${notamColors[key].color},1'})` }
					: { 'fill-color': `rgba(${notamColors[key].color},0'})` },
			},
			'z-index-1' // Place notam below z-index-1 and below the user-drawn zones
		);
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	!map.getLayer(`notam-line-${key}`) &&
		map.addLayer(
			{
				id: `notam-line-${key}`,
				type: 'line',
				source: `notam-${key}`,
				layout: {
					'line-sort-key': 2,
				},
				paint: {
					'line-color': `rgba(${notamColors[key].color},1'})`,
					'line-width': 2,
				},
			},
			'z-index-1' // Place notam below z-index-1 and below the user-drawn zones
		);
};

/**
 * Add notam to the map
 * @param map Current map component
 * @param notamRS The notam recoil state. @see INotamReturnZones
 */
export const addNotam = (map: mapboxgl.Map, notamRS: INotamReturnZones): void => {
	Object.keys(notamRS).forEach((key) => {
		const curLayer = notamRS[key];
		if (!map.getSource(`notam-${key}`)) {
			map.addSource(`notam-${key}`, {
				type: 'geojson',
				data: curLayer,
				tolerance: 0,
			});
			const color = notamColors[key];
			addZLayers(map);
			constructNotam(map, key, color.fill);
		} else {
			addZLayers(map);
			const source = map.getSource(`notam-${key}`) as GeoJSONSource;
			source.setData(curLayer);
		}
	});
};

/**
 * Check for duplicates in MapBox layer query function, and remove them if found.
 * -
 * @param features The feature array to filter out duplicates from.
 * @returns newFeatureArray The new array with no duplicates
 */

export const removeDuplicateFeatures = (features: mapboxgl.MapboxGeoJSONFeature[] | undefined): mapboxgl.MapboxGeoJSONFeature[] => {
	const newFeatureArray: mapboxgl.MapboxGeoJSONFeature[] = [];
	features?.forEach((e) => {
		if (e.layer.id.includes('notam') && newFeatureArray.filter((item) => item.properties?.name === e.properties?.name).length === 0) {
			newFeatureArray.push(e);
		} else if (newFeatureArray.filter((item) => item.properties?.id === e.properties?.id).length === 0) {
			newFeatureArray.push(e);
		}
	});
	return newFeatureArray;
};

/**
 * Adds or removes a 3D terrain layer (with skybox) to the map in question
 *
 * @see https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
 *
 * @param map Map to add or remove layer from
 * @param addLayer true to add, false to remove
 */
export const handle3DTerrainLayer = (map: mapboxgl.Map, addLayer = false): void => {
	if (!addLayer) {
		map.setTerrain(null);
		map.getSource('mapbox-dem') && map.removeSource('mapbox-dem');
		map.getLayer('sky') && map.removeLayer('sky');
	} else {
		if (!map.getSource('mapbox-dem')) {
			map.addSource('mapbox-dem', {
				type: 'raster-dem',
				url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
				tileSize: 512,
				maxzoom: 14,
			});
		}

		// add the DEM source as a terrain layer with exaggerated height
		map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

		// add a sky layer that will show when the map is highly pitched
		if (!map.getLayer('sky')) {
			map.addLayer({
				id: 'sky',
				type: 'sky',
				paint: {
					'sky-type': 'atmosphere',
					'sky-atmosphere-sun': [0.0, 0.0],
					'sky-atmosphere-sun-intensity': 15,
				},
			});
		}
	}
};
