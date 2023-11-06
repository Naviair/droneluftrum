import { IOperationGeoData, IOperationGeoDataFeature } from '@naviair-utm/node-shared-interfaces';
import * as turf from '@turf/turf';
import { FeatureCollection } from 'geojson';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { addZLayers } from '../../../../Components';

// eslint-disable-next-line @typescript-eslint/naming-convention
const SOURCE_DRAW_ID = 'draw_label';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const convertFeatures = (features: IOperationGeoDataFeature[], convertCirles?: boolean, addLabel?: boolean) => {
	const generateLabel = (feature: IOperationGeoDataFeature) => {
		const props = feature.properties;
		let content = '';
		content = content.concat(props.type ? `${props.type}\n` : '');
		content = content.concat(
			props.minHeightValue !== undefined && props.minHeightType && props.maxHeightValue !== undefined && props.maxHeightType
				? `${props.minHeightValue}m ${props.minHeightType} - ${props.maxHeightValue}m ${props.maxHeightType}\n`
				: ''
		);
		return { labelHeader: props.name ? `${props.name}` : '', labelContent: content };
	};

	const featuresAsPolygons = features.map((feature) => {
		if (addLabel) {
			feature = {
				...feature,
				properties: { ...feature.properties, ...generateLabel(feature) },
			};
		}
		if (feature.properties.circleRadius) {
			const geometry = feature.geometry as GeoJSON.Polygon;
			const center: turf.helpers.Coord = [geometry.coordinates[0][0][0], geometry.coordinates[0][0][1]];
			const circlePolygon = turf.circle(center, feature.properties.circleRadius, { units: 'kilometers', properties: feature.properties });
			return {
				...circlePolygon,
				id: feature.id,
			} as IOperationGeoDataFeature;
		} else {
			return feature;
		}
	});

	const featureCollection: IOperationGeoData = {
		features: convertCirles ? featuresAsPolygons : features,
		type: 'FeatureCollection',
	};
	return featureCollection;
};

export const handleLabels = (map: mapboxgl.Map, features: IOperationGeoDataFeature[]): void => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const fullFeatures = convertFeatures(features, true, true);
	const centerFeatures = fullFeatures.features.map((feature) => {
		return { ...turf.pointOnFeature(feature as turf.AllGeoJSON), properties: feature.properties };
	});
	const centerFeatureCollection = turf.featureCollection(centerFeatures);
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!map.getSource(SOURCE_DRAW_ID)) {
		map.addSource(SOURCE_DRAW_ID, {
			type: 'geojson',
			data: centerFeatureCollection as FeatureCollection,
		});
	} else {
		const source = map.getSource(SOURCE_DRAW_ID) as GeoJSONSource;
		source.setData(centerFeatureCollection as FeatureCollection);
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!map.getLayer(SOURCE_DRAW_ID)) {
		addZLayers(map);
		map.addLayer(
			{
				id: SOURCE_DRAW_ID,
				type: 'symbol',
				source: SOURCE_DRAW_ID,
				layout: {
					'text-field': [
						'format',
						['upcase', ['case', ['has', 'labelHeader'], ['get', 'labelHeader'], '']],
						{ 'font-scale': 1 },
						'\n',
						{},
						['upcase', ['case', ['has', 'labelContent'], ['get', 'labelContent'], '']],
						{ 'font-scale': 0.8 },
					],
					'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
					'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
					//'text-radial-offset': 0.5,
					'text-justify': 'center',
					'text-allow-overlap': true,
					'symbol-sort-key': 5,
				},
				paint: {
					'text-color': '#202',
					'text-halo-color': '#fff',
					'text-halo-width': 2,
				},
			},
			'z-index-2' // Place the symbol below z-index-2, but still above z-index-1 and the notams
		);
	}
};

export const handleDeleteLabels = (map: mapboxgl.Map) => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (map.getLayer(SOURCE_DRAW_ID)) {
		const source = map.getSource(SOURCE_DRAW_ID) as GeoJSONSource;
		source.setData(turf.featureCollection([]) as FeatureCollection);
	}
};
