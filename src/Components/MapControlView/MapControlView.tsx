import React from 'react';
import { useTranslation } from 'react-i18next';
import { SingleLayout } from '@naviair-utm/react-shared-components';
import { AroundControl, CompassControl, GeoControl, RulerControl } from '../../Components/MapControl/Controls';
import { MapControl } from '../../Components/MapControl/MapControl';
import { Recoil, useRecoilValue } from '../../Recoil';

export const MapControlView: React.FC = () => {
	const [t] = useTranslation('translations');
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const defaultLayer = useRecoilValue(Recoil.MapLayerGroup.Atom);
	const defaultBackground = useRecoilValue(Recoil.MapBackground.Atom);
	const activeLanguage = useRecoilValue(Recoil.Language.Atom);
	const mapSettings = configuration.settings;
	const { renderMapControl } = MapControl({
		settings: mapSettings,
		mapUrl: 'mapbox://styles/mapbox/',
		defaultBackground: defaultBackground,
		boundaries: mapSettings.mapbox.boundaries,
		defaultGeoLocation: mapSettings.mapbox.defaultGeolocation,
		defaultLayer: defaultLayer,
		backgrounds: mapSettings.map.types,
		controls: [
			{ controlType: [RulerControl(), AroundControl(), GeoControl(), CompassControl()], placement: 'bottom-right' },
			{ controlType: [RulerControl(), AroundControl(), GeoControl(), CompassControl()], placement: 'top-left' },
		],
		sidePanels: [
			{
				id: 'disclaimer',
				className: 'btn_disclaimer',
				icon: 'exclamation',
				activeIcon: 'arrow-to-right',
				onClickTrigger: 'showSidePanel',
				onClickComponent: 'safety',
				tooltip: t('Disclaimer'),
			},
			{
				id: 'settings',
				icon: 'layer-group',
				activeIcon: 'arrow-to-right',
				onClickTrigger: 'showSidePanel',
				onClickComponent: 'settings',
				tooltip: t('Kortindstillinger'),
			},
			{ id: 'download', icon: 'hdd', activeIcon: 'arrow-to-right', onClickTrigger: 'showSidePanel', onClickComponent: 'download', tooltip: t('Download') },
			{
				id: 'weather',
				icon: 'sun-cloud',
				activeIcon: 'arrow-to-right',
				onClickTrigger: 'showSidePanel',
				onClickComponent: 'weather',
				tooltip: t('Vejrinformation'),
			},
		],
		tilesets: mapSettings.map.tilesets,
		lang: activeLanguage,
		layers: mapSettings.map.layers,
		addBuildings: true,
		goToUserLocationOnLoad: true,
		withInfoBox: true,
	});

	return <SingleLayout fill>{renderMapControl}</SingleLayout>;
};
