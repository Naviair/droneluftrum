import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { addZLayers, MapControl } from '../MapControl/MapControl';
import { Recoil, useRecoilValue } from '../../Recoil';
import * as turf from '@turf/turf';
import { IOperationGeoDataFeature } from '@naviair-utm/node-shared-interfaces';
import { convertFeatures, handleLabels } from '../../Views/App/ListView/ListOperation/ListOperationHelpers';
import { getClickableLayers } from '../MapControl/mapControlHelper';
import booleanIntersects from '@turf/boolean-intersects';
import { useTranslation } from 'react-i18next';

interface IMapControlReadOnlyProps {
	bounds?: turf.helpers.BBox;
	features?: IOperationGeoDataFeature[];
	onZoneRulesUpdate?: (zones: mapboxgl.MapboxGeoJSONFeature[], loading: boolean) => void;
}

export interface IMapControlReadOnlyRef {
	getCanvas: () => Promise<string>;
}

export const MapControlReadOnly = forwardRef<IMapControlReadOnlyRef, React.PropsWithChildren<IMapControlReadOnlyProps>>((props, ref) => {
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const mapSettings = configuration.settings;
	const [t] = useTranslation('translations');
	const { renderMapControl, getMapState } = MapControl({
		settings: mapSettings,
		mapUrl: 'mapbox://styles/mapbox/',
		defaultBackground: useRecoilValue(Recoil.MapBackground.Atom),
		boundaries: mapSettings.mapbox.boundaries,
		defaultGeoLocation: mapSettings.mapbox.defaultGeolocation,
		defaultLayer: useRecoilValue(Recoil.MapLayerGroup.Atom),
		backgrounds: mapSettings.map.types,
		tilesets: mapSettings.map.tilesets,
		layers: mapSettings.map.layers,
		defaultZoomLevel: 10,
		interactive: false,
		withInfoBox: false,
	});

	mapboxgl.accessToken = configuration.settings.mapbox.apiKey;

	//Handles functions there can be called with createRef on component
	useImperativeHandle(ref, () => ({
		getCanvas(): Promise<string> {
			return getCanvas();
		},
	}));

	//Get the image of the canvas
	const getCanvas = (): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (getMapState && !getMapState.mapComponent.isMoving()) {
				try {
					const imageDataUrl = getMapState.mapComponent.getCanvas().toDataURL();
					if (imageDataUrl) {
						resolve(imageDataUrl);
					} else {
						reject(t('Intet kort tilgængeligt, prøv igen om lidt'));
					}
				} catch (err) {
					reject(err);
				}
			} else {
				reject(t('Kort ikke klart, prøv igen om lidt'));
			}
		});
	};

	useEffect(() => {
		if (props.features && getMapState) {
			handleAddFeatures();
			handleLabels(getMapState.mapComponent, convertFeatures(props.features, true, true).features);
		}
	}, [props.features, getMapState]);

	useEffect(() => handleBounds(), [getMapState, props.bounds]);
	const handleBounds = () => {
		if (getMapState && props.bounds) {
			const convertedBounds: mapboxgl.LngLatBoundsLike = [
				[props.bounds[0], props.bounds[1]],
				[props.bounds[2], props.bounds[3]],
			];
			getMapState.mapComponent.fitBounds(convertedBounds, { padding: 20 });
		} else if (getMapState) {
			getMapState.mapComponent.zoomTo(4);
		}
	};

	const handleAddFeatures = () => {
		if (getMapState?.mapComponent && props.features) {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const SOURCE_ID = 'draw_zones';
			const featureCollection = convertFeatures(props.features, true, true);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!getMapState.mapComponent.getSource(SOURCE_ID)) {
				getMapState.mapComponent.addSource(SOURCE_ID, {
					type: 'geojson',
					data: featureCollection,
				});
			} else {
				const source = getMapState.mapComponent.getSource(SOURCE_ID) as GeoJSONSource;
				source.setData(featureCollection);
			}
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!getMapState.mapComponent.getLayer(SOURCE_ID)) {
				addZLayers(getMapState.mapComponent);
				getMapState.mapComponent.addLayer(
					{
						id: SOURCE_ID,
						type: 'fill',
						source: SOURCE_ID,
						layout: {
							'fill-sort-key': 4,
						},
						//filter: ['all', ['has', 'color']],
						paint: {
							//TODO: SHOULD BE DEFAULT CORRECT VALUE
							'fill-color': ['case', ['has', 'color'], ['get', 'color'], '#999999'],
							'fill-outline-color': ['case', ['has', 'color'], ['get', 'color'], '#999999'],
							'fill-opacity': 0.5,
						},
					},
					'z-index-2' // Place below z-index-2, but still above z-index-1
				);
			}
		}
	};

	//Get zones from drawing
	useEffect(() => {
		if (getMapState && props.features) {
			props.onZoneRulesUpdate?.([], true);
			getMapState.mapComponent.once('idle', () => {
				handleZoneRules(getMapState.mapComponent, props.features);
			});
		}
	}, [props.features, getMapState]);
	const handleZoneRules = useCallback(
		(map: mapboxgl.Map, features?: IOperationGeoDataFeature[]) => {
			if (features && features.length > 0) {
				const overlapZones: mapboxgl.MapboxGeoJSONFeature[] = [];
				const featureCollection = convertFeatures(features, true);
				const bbox = turf.bbox(featureCollection as turf.AllGeoJSON);
				const layers = getClickableLayers(mapSettings.map.tilesets);
				const bboxToPoint: [mapboxgl.PointLike, mapboxgl.PointLike] = [map.project([bbox[0], bbox[1]]), map.project([bbox[2], bbox[3]])];
				const bboxZones = map.queryRenderedFeatures(bboxToPoint, { layers: layers });
				bboxZones.map((zone) => {
					featureCollection.features.map((feature) => {
						const checkZone = booleanIntersects(zone, feature);
						if (checkZone && overlapZones.filter((x) => x.id === zone.id).length === 0) {
							overlapZones.push(zone);
						}
					});
				});
				props.onZoneRulesUpdate?.(overlapZones, false);
			} else {
				props.onZoneRulesUpdate?.([], false);
			}
		},
		[props.features, getMapState]
	);

	useEffect(() => handleResize(), [getMapState]);
	const handleResize = () => {
		if (getMapState?.mapComponent) {
			getMapState.mapComponent.resize();
		}
	};

	return renderMapControl;
});
