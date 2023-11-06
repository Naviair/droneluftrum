import { IControl } from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MapboxControl } from '../../MapboxControl';
import { draw } from '../draw_init';
import { union, Feature, Polygon } from '@turf/turf';
import { useTranslation } from 'react-i18next';

export const CombineControl = (): IControl => {
	const [t] = useTranslation('translations');
	const handleOnClick = () => {
		const selectedFeatures = draw.getSelected().features.filter((feature) => feature.geometry.type === 'Polygon') as Feature<Polygon>[];
		if (!selectedFeatures.length) return;
		const unionPoly = union(...selectedFeatures);
		/*if (unionPoly.geometry?.type === 'MultiPolygon'){
			
		}*/
		const ids = selectedFeatures.map((i) => String(i.id));
		draw.delete(ids);
		//unionPoly.id = ids.join('-');
		if (unionPoly.geometry) {
			draw.add(unionPoly.geometry);
		}
		//draw.changeMode('simple_select', { featureIds: [unionPoly.id] });
	};
	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		icon: 'object-group',
		id: 'combine',
		tooltip: t('Kombiner zoner'),
	});

	const handleOnAdd = (map: mapboxgl.Map): HTMLElement => {
		return mapboxControl.onAdd(map);
	};

	const handleOnRemove = (map: mapboxgl.Map) => {
		return mapboxControl.onRemove(map);
	};

	return {
		onAdd: handleOnAdd,
		onRemove: handleOnRemove,
	};
};
