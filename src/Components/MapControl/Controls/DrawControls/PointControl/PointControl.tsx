import { IControl } from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MapboxControl } from '../../MapboxControl';
import { draw } from '../draw_init';
import { useTranslation } from 'react-i18next';

export const PointControl = (): IControl => {
	const [t] = useTranslation('translations');
	const handleOnClick = () => {
		draw.changeMode('draw_point');
	};
	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		icon: 'map-marker-alt',
		id: 'draw-point',
		tooltip: t('Tilføj punkt'),
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
