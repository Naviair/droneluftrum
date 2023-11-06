import { IControl } from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MapboxControl } from '../../MapboxControl';
import { draw } from '../draw_init';
import { useTranslation } from 'react-i18next';

export const CircleControl = (): IControl => {
	const [t] = useTranslation('translations');

	const handleOnClick = () => {
		draw.changeMode('draw_circle');
	};

	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		icon: 'circle',
		id: 'draw-circle',
		tooltip: t('Tilføj cirkel'),
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
