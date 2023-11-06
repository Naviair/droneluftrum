import mapboxgl, { IControl } from 'mapbox-gl';
import { distance, Units } from '@turf/turf';
import { MapboxControl } from '../';
import IGeoJSON from 'geojson';
import { IGeoJSONFeaturePoint } from '@naviair-utm/node-shared-interfaces/dist/IGeoJson';
import { useTranslation } from 'react-i18next';

/* eslint-disable @typescript-eslint/naming-convention */
const UNITS: Units = 'kilometers';
const LAYER_LINE = 'controls-layer-line';
const LAYER_SYMBOL = 'controls-layer-symbol';
const SOURCE_LINE = 'controls-source-line';
const SOURCE_SYMBOL = 'controls-source-symbol';
const FONT = ['Roboto Medium'];
const MAIN_COLOR = '#263238';
const SECONDARY_COLOR = '#fff';

const MARKER_WIDTH = '12px';
const MARKER_HEIGHT = '12px';
const MARKER_BORDER_RADIUS = '50%';
const MARKER_BACKGROUND = SECONDARY_COLOR;
const MARKER_BOX_SIZING = 'border-box';
const MARKER_BORDER = `2px solid ${MAIN_COLOR}`;
/* eslint-enable @typescript-eslint/naming-convention */

const geoLineString = (coordinates: IGeoJSON.Position[]): IGeoJSON.Feature => {
	return {
		type: 'Feature',
		properties: {},
		geometry: {
			type: 'LineString',
			coordinates,
		},
	};
};

const geoPoint = (coordinates: IGeoJSON.Position[], labels: (string | 0)[]): IGeoJSON.FeatureCollection => {
	return {
		type: 'FeatureCollection',
		features: coordinates.map((c, i) => ({
			type: 'Feature',
			properties: {
				text: labels[i],
			},
			geometry: {
				type: 'Point',
				coordinates: c,
			},
		})),
	};
};

const labelFormat = (number: number) => {
	if (number < 1) {
		return `${(number * 1000).toFixed()} m`;
	}
	return `${number.toFixed(2)} km`;
};

export const RulerControl = (): IControl => {
	const [t] = useTranslation('translations');
	let controlMap: mapboxgl.Map;
	let markers: mapboxgl.Marker[] = [];
	let coordinates: IGeoJSON.Position[] = [];
	let labels: (string | 0)[] = [];

	const draw = () => {
		if (!controlMap.getSource(SOURCE_LINE)) {
			controlMap.addSource(SOURCE_LINE, {
				type: 'geojson',
				data: geoLineString(coordinates),
			});
		}

		if (!controlMap.getSource(SOURCE_SYMBOL)) {
			controlMap.addSource(SOURCE_SYMBOL, {
				type: 'geojson',
				data: geoPoint(coordinates, labels),
			});
		}

		controlMap.addLayer({
			id: LAYER_LINE,
			type: 'line',
			source: SOURCE_LINE,
			paint: {
				'line-color': MAIN_COLOR,
				'line-width': 2,
			},
		});

		controlMap.addLayer({
			id: LAYER_SYMBOL,
			type: 'symbol',
			source: SOURCE_SYMBOL,
			layout: {
				'text-field': '{text}',
				'text-font': FONT,
				'text-anchor': 'top',
				'text-size': 12,
				'text-offset': [0, 0.8],
			},
			paint: {
				'text-color': MAIN_COLOR,
				'text-halo-color': SECONDARY_COLOR,
				'text-halo-width': 1,
			},
		});
	};

	const coordinatesToLabels = () => {
		let sum = 0;
		return coordinates.map((coordinate, index) => {
			if (index === 0) return 0;
			const particalDistance = distance(coordinates[index - 1], coordinates[index], { units: UNITS });
			sum += particalDistance;
			return `${labelFormat(particalDistance)}/${labelFormat(sum)}`;
		});
	};

	const mapClickHandler = (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
		const markerNode = document.createElement('div');
		markerNode.style.width = MARKER_WIDTH;
		markerNode.style.height = MARKER_HEIGHT;
		markerNode.style.borderRadius = MARKER_BORDER_RADIUS;
		markerNode.style.background = MARKER_BACKGROUND;
		markerNode.style.boxSizing = MARKER_BOX_SIZING;
		markerNode.style.border = MARKER_BORDER;

		const marker = new mapboxgl.Marker({
			element: markerNode,
			draggable: true,
		})
			.setLngLat(event.lngLat)
			.addTo(controlMap);

		coordinates.push([event.lngLat.lng, event.lngLat.lat]);
		labels = coordinatesToLabels();
		const lineSource = controlMap.getSource(SOURCE_LINE);
		lineSource.type === 'geojson' && lineSource.setData(geoLineString(coordinates));
		const symbolSource = controlMap.getSource(SOURCE_SYMBOL);
		symbolSource.type === 'geojson' && symbolSource.setData(geoPoint(coordinates, labels));

		markers.push(marker);
		marker.on('drag', () => {
			const index = markers.indexOf(marker);
			const lngLat = marker.getLngLat();
			coordinates[index] = [lngLat.lng, lngLat.lat];
			labels = coordinatesToLabels();
			const lineSource = controlMap.getSource(SOURCE_LINE);
			lineSource.type === 'geojson' && lineSource.setData(geoLineString(coordinates));
			const symbolSource = controlMap.getSource(SOURCE_SYMBOL);
			symbolSource.type === 'geojson' && symbolSource.setData(geoPoint(coordinates, labels));
		});
	};

	const clearData = () => {
		markers = [];
		coordinates = [];
		labels = [];
	};

	const measuringOn = () => {
		clearData();
		draw();
		controlMap.getCanvas().style.cursor = 'crosshair';
		controlMap.on('click', mapClickHandler);
		controlMap.on('style.load', () => draw());
		controlMap.fire('ruler.on');
	};

	const measuringOff = () => {
		controlMap.getCanvas().style.cursor = '';
		controlMap.removeLayer(LAYER_LINE);
		controlMap.removeLayer(LAYER_SYMBOL);
		controlMap.removeSource(SOURCE_LINE);
		controlMap.removeSource(SOURCE_SYMBOL);
		markers.forEach((m) => m.remove());
		controlMap.off('click', mapClickHandler);
		controlMap.off('style.load', () => draw());
		controlMap.fire('ruler.off');
		clearData(); /* Make sure we clear data to prevent measuring from still being visualized when eg changing map background. */
	};

	const handleOnClick = (isActive?: boolean) => {
		isActive ? measuringOn() : measuringOff();
	};

	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		icon: 'ruler',
		setActive: true,
		id: 'ruler',
		tooltip: t('Målebånd'),
	});

	const handleOnAdd = (map: mapboxgl.Map): HTMLElement => {
		controlMap = map;
		return mapboxControl.onAdd(map);
	};

	const handleOnRemove = (map: mapboxgl.Map) => {
		measuringOff();
		controlMap.off('click', mapClickHandler);
		return mapboxControl.onRemove(map);
	};

	return {
		onAdd: handleOnAdd,
		onRemove: handleOnRemove,
	};
};
