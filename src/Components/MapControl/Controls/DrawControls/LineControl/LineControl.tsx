import { IControl } from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MapboxControl } from '../../MapboxControl';
import { draw } from '../draw_init';
import { useTranslation } from 'react-i18next';

export const LineControl = (): IControl => {
	const [t] = useTranslation('translations');
	const handleOnClick = () => {
		draw.changeMode('draw_line_string');
	};

	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		icon: 'slash',
		id: 'draw-line',
		tooltip: t('Tilføj linje'),
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
