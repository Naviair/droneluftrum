import { IControl } from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import { MapboxControl } from '../';
import aroundIcon from './icon-3d.svg';
import './styles.scss';

const DEFAULT_PITCH = 0;
const DEFAULT_BEARING = 0;
const ROTATE_PITCH = 60;
const ROTATE_BEARING = -40;

export const AroundControl = (): IControl => {
	const [t] = useTranslation('translations');
	let controlMap: mapboxgl.Map;

	const handleOnClick = () => {
		const currentPitch = controlMap.getPitch();
		const currentBearing = controlMap.getBearing();
		if (currentPitch !== 0 || currentBearing !== 0) {
			controlMap.easeTo({ pitch: DEFAULT_PITCH, bearing: DEFAULT_BEARING });
		} else {
			controlMap.easeTo({ pitch: ROTATE_PITCH, bearing: ROTATE_BEARING });
		}
	};

	const mapboxControl = MapboxControl({
		onClick: handleOnClick,
		rawIcon: aroundIcon,
		className: 'mapboxgl-ctrl-around',
		id: 'around',
		tooltip: t('3D visning'),
	});

	const handleOnAdd = (map: mapboxgl.Map): HTMLElement => {
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
