import { IControl } from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import { MapboxControl } from '../';
import compassIcon from './icon-pointer.svg';

export const CompassControl = (): IControl => {
	const [t] = useTranslation('translations');
	let controlMap: mapboxgl.Map;

	const mapboxControl = MapboxControl({
		rawIcon: compassIcon,
		rotateIcon: true,
		id: 'compass',
		tooltip: t('Kompas'),
	});

	const handleOnAdd = (map: mapboxgl.Map): HTMLElement => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		controlMap = map;

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
