import { IControl, GeolocateControl } from 'mapbox-gl';

export const GeoControl = (): IControl => {
	// TODO: Add AntD tooltip instead of MapBox default (<Antd.Tooltip title={props.tooltip}>)

	const geolocateControl = new GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true,
		},
		trackUserLocation: true,
		showAccuracyCircle: false,
	});

	return geolocateControl;
};
