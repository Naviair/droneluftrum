import { ILatLng, TSettings, TSettingsMapLayer, TSettingsMapTilesets, TSettingsMapType } from '@naviair-utm/node-shared-interfaces';
import { buildingLayerTemplate, dynamicFillLayerTemplate, dynamicLineLayerTemplate } from '../mapboxLayerTemplates';
import { CallbackControl } from '../Controls';
import { setTimeout } from 'timers';
import mapboxgl, { IControl } from 'mapbox-gl';
import { addMarker, getClickableLayers, setLayer } from './index';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

type TPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * @interface IMapSettings
 * @param defaultBackground Set the defaultBackground for the mapComponent
 * @param defaultLayer Set the default layer for the mapComponent
 * @param settings Define initialization settings for map component. @see TSettings
 * @param defaultGeoLocation Set the default geoLocation. As default this will be set to current location, if user has accepted browser location service.
 * @param boundaries Limit the mapview by setting map boundaries.
 * @param tilesets Tilesets on the map. @see TSettingsMapTilesets
 * @param layers Layers to be rendered on the map. @see TSettingsMapLayer
 * @param background Set map backgrounds. @see TSettingsMapType
 * @param addBuildings Set whether buildings should be shown on the map.
 * @param controls Set map controls to be displayed on the map.
 * @param draw Initialize a mapbox-gl-draw element on the map.
 * @param withInfoBox Attach infobox to map.
 * @param mapUrl Url for particular map.
 * @param lang Language (? TODO: Definition)
 * @param goToUserLocationOnLoad Centers map on user location when map is idling.
 */

export interface IMapSettings {
	defaultBackground: number;
	defaultLayer: number;
	settings: TSettings;
	defaultGeoLocation: { latitude: number; longitude: number };
	boundaries: [number, number, number, number];
	tilesets: TSettingsMapTilesets;
	layers: TSettingsMapLayer[];
	backgrounds: TSettingsMapType[];
	addBuildings?: boolean;
	controls?: { controlType: IControl[]; placement: TPosition }[];
	draw?: MapboxDraw;
	sidePanels?: TSidePanel[];
	mapUrl: string;
	withInfoBox?: boolean;
	lang?: string;
	interactive?: boolean;
	disableAddMarker?: boolean;
	defaultZoomLevel?: number;
	goToUserLocationOnLoad?: boolean;
}

/* Return interface for Initialize map */
export interface IMap {
	mapComponent: mapboxgl.Map;
	setLayer: (activeLayer: number) => void;
	setBackground: (activeBackground: number) => void;
	addLayers: (activeLayer: number) => void;
	latLng: ILatLng;
}

/**
 * Initialize the map component.
 * @param container             |       The container to contain the map component
 * @param settings              |       The map settings. @see IMapSettings
 */
export const initializeMap = (container: HTMLDivElement, settings: IMapSettings): Promise<IMap> => {
	return new Promise((resolve) => {
		/**
		 * TODO: Should be removed to configuration
		 */
		const defaultCenter: [number, number] = [10.771244, 56.176146];

		//Set map from mapbox
		const map = new mapboxgl.Map({
			container: container,
			//Optimize added for faster load
			style: `${settings.mapUrl}${settings.backgrounds[settings.defaultBackground].url}?optimize=true`,
			zoom: settings.defaultZoomLevel ? settings.defaultZoomLevel : 6,
			center: defaultCenter,
			maxBounds: settings.boundaries,
			//Remove all rights reserved on map
			attributionControl: false,
			interactive: settings.interactive !== false ? true : false,
			preserveDrawingBuffer: settings.interactive ? false : true, //Required for export to PNG for readOnly
		});

		const layersArr: string[] = getClickableLayers(settings.tilesets);

		//Handle resize when screen size changes
		const handleResize = () =>
			setTimeout(() => {
				map.resize();
			}, 100);
		window.addEventListener('resize', handleResize);

		//Add buildings and layers
		const addLayers = (activeLayer?: number) => {
			settings.addBuildings && addMapBuildingLayer(map);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (settings.tilesets && settings.layers) {
				addMapDynamicLayers(map, settings.tilesets);

				setLayer(map, settings.layers, settings.tilesets, activeLayer ? activeLayer : settings.defaultLayer);
			}
		};

		//Set map in state
		map.once('load', () => {
			settings.controls && addMapControls(map, settings.controls, settings.draw, settings.sidePanels);
			addLayers();
			handleResize();
			resolve({
				mapComponent: map,
				setLayer: (activeLayer) => setLayer(map, settings.layers, settings.tilesets, activeLayer),
				setBackground: (activeBackground) => {
					setBackground(map, `${settings.mapUrl}${settings.backgrounds[activeBackground].url}`);
				},
				addLayers: (activeLayer) => addLayers(activeLayer),
				latLng: { lat: defaultCenter[1], long: defaultCenter[0] },
			});
		});

		map.on('click', async (evt) => {
			if (settings.interactive !== false && settings.disableAddMarker !== true) {
				addMarker(map, { lat: evt.lngLat.lat, long: evt.lngLat.lng }, layersArr, settings.lang);
			}
		});
	});
};

/**
 * Type definition for side panels on the map component.
 * @param id                |   The ID of the sidePanel.
 * @param className         |   The className of the sidePanel, for CSS reference.
 * @param icon              |   Icon of the sidePanel. Used when sidePanel is NOT active.
 * @param activeIcon        |   ACTIVE Icon of the sidePanel.
 * @param onClickTrigger    |   The listener for the onClickEvent.
 * @param onClickComponent  |   SidePanel component title.
 */
type TSidePanel = {
	id: string;
	className?: string;
	icon: string;
	activeIcon: string;
	onClickTrigger: string;
	onClickComponent: string;
	tooltip: string;
};

/**
 * Add MapControls defined in controls prop for map.
 * @param map              |    The map component that should contain the new controls.
 * @param controls         |    The controls (array) that should be added, and the placement of these.
 * @param draw             |    The mapbox draw element that should be added to the map.
 */

export const addMapControls = (
	map: mapboxgl.Map,
	controls: { controlType: IControl[]; placement: TPosition }[],
	draw?: MapboxDraw,
	sidepanels?: TSidePanel[]
): void => {
	draw ? map.addControl(draw) : undefined;
	controls.map((controls) => {
		controls.controlType.length > 1
			? controls.controlType.map((control) => map.addControl(control, controls.placement))
			: map.addControl(controls.controlType[0], controls.placement);
	});
	sidepanels?.map((panel) => {
		map.addControl(
			CallbackControl({
				buttonGroup: 'sidePanel',
				...panel,
				onClick: (isActive) => map.fire(panel.onClickTrigger, { component: panel.onClickComponent, status: isActive }),
			})
		);
	});
};

/**
 * Sets the map background.
 * @param map           |       The map component.
 * @param mapPath       |       The path of the map style.
 */
export const setBackground = (map: mapboxgl.Map, mapPath: string): void => {
	map.setStyle(mapPath);
};

/**
 * Add 3d buildings to the map.
 * @param map           |       The map componentz
 */
const addMapBuildingLayer = (map: mapboxgl.Map): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!map.getLayer('3d-buildings')) {
		map.addLayer(buildingLayerTemplate);
	}
};

/**
 * Add dynamic layers to the map
 * @param map           |       The map component
 * @param tilesets      |       The tilesets that should be added to the map.
 */
export const addMapDynamicLayers = (map: mapboxgl.Map, tilesets: TSettingsMapTilesets): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const addMapSource = (id: string) => !map.getSource(id) && map.addSource(id, { type: 'vector', url: `mapbox://${id}` });
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const addMapLayer = (layer: mapboxgl.AnyLayer) => map.addLayer(layer, map.getLayer('3d-buildings') ? '3d-buildings' : undefined);
	Object.keys(tilesets).forEach((tilesetKey) => {
		Object.keys(tilesets[tilesetKey]).forEach((tilesetTypeKey) => {
			const { layer, id, layerType } = tilesets[tilesetKey][tilesetTypeKey];
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!map.getLayer(id)) {
				addMapSource(id);
				if (layerType === 'line') {
					addMapLayer(dynamicLineLayerTemplate(id, layer));
				} else {
					addMapLayer(dynamicFillLayerTemplate(id, layer));
				}
			}
		});
	});
};
