import React, { createRef, forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl from 'mapbox-gl';
import { MapControl } from '../MapControl/MapControl';
import { Recoil, useRecoilValue } from '../../Recoil';
import { AroundControl, CompassControl, GeoControl, RulerControl } from '../MapControl/Controls';
import { PolygonControl, TrashControl, CircleControl, SelectControl } from '../MapControl/Controls/DrawControls';
import { draw } from '../MapControl/Controls/DrawControls/draw_init';
import { Antd, Form } from '../Common';
import { Drawer, IDrawerRef } from '@naviair-utm/react-shared-components';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import { EHeightType, EOperationGeoDataFeatureType, IOperationGeoDataFeature, IOperationGeoDataFeatureProperties } from '@naviair-utm/node-shared-interfaces';
//import { ExtraZoneInput } from './ExtraZoneInput';
import { useModalState } from '../../Hooks';
import * as turf from '@turf/turf';
import { convertFeatures, handleLabels } from '../../Views/App/ListView/ListOperation/ListOperationHelpers';

type TDrawEvt = {
	features: IOperationGeoDataFeature[];
	type: 'draw.selectionchange' | 'draw.update' | 'draw.update' | 'draw.delete';
	target: mapboxgl.Map;
};

const defaultZoneValues: IOperationGeoDataFeatureProperties = {
	minHeightValue: 0,
	minHeightType: EHeightType.AGL,
	maxHeightValue: 120,
	maxHeightType: EHeightType.AGL,
	color: '#512DA8', //related to Form.ColorPicker DEFAULT_COLOR
};

interface IMapControlEditProps {
	bounds?: turf.helpers.BBox;
	features?: IOperationGeoDataFeature[];
}

export interface IMapControlEditRef {
	submit: () => IOperationGeoDataFeature[];
	cancel: () => void;
}

export const MapControlEdit = forwardRef<IMapControlEditRef, React.PropsWithChildren<IMapControlEditProps>>((props, ref) => {
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const mapSettings = configuration.settings;
	const drawerRef = createRef<IDrawerRef>();
	const { isOpen, onClose, setActive, activeItem } = useModalState<IOperationGeoDataFeature>();
	const [t] = useTranslation('translations');
	const [form] = Antd.Form.useForm<IOperationGeoDataFeatureProperties>();
	const { renderMapControl, getMapState, getMapOnReadyState } = MapControl({
		settings: mapSettings,
		mapUrl: 'mapbox://styles/mapbox/',
		defaultBackground: useRecoilValue(Recoil.MapBackground.Atom),
		boundaries: mapSettings.mapbox.boundaries,
		defaultGeoLocation: mapSettings.mapbox.defaultGeolocation,
		defaultLayer: useRecoilValue(Recoil.MapLayerGroup.Atom),
		backgrounds: mapSettings.map.types,
		draw: draw,
		controls: [
			{ controlType: [RulerControl(), AroundControl(), GeoControl(), CompassControl()], placement: 'bottom-right' },
			{
				controlType: [TrashControl(), SelectControl() /*CombineControl(), PointControl(), LineControl(),*/, CircleControl(), PolygonControl()],
				placement: 'bottom-left',
			},
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
		],
		tilesets: mapSettings.map.tilesets,
		layers: mapSettings.map.layers,
		addBuildings: true,
		disableAddMarker: true,
		withInfoBox: false,
	});

	mapboxgl.accessToken = configuration.settings.mapbox.apiKey;

	//Handles functions there can be called with createRef on component
	useImperativeHandle(ref, () => ({
		submit(): IOperationGeoDataFeature[] {
			return getData();
		},
		cancel(): void {
			handleOnClose();
		},
	}));

	const typeTranslations = {
		[EOperationGeoDataFeatureType.FLIGHTZONE]: t('Flyvezone'),
		[EOperationGeoDataFeatureType.BUFFER]: t('Bufferzone'),
		[EOperationGeoDataFeatureType.TAKEOFF_LANDING]: t('Takeoff/Landing'),
		[EOperationGeoDataFeatureType.EMERGENCY]: t('Emergency zone'),
		[EOperationGeoDataFeatureType.GROUND_RISK]: t('Ground risk zone'),
		[EOperationGeoDataFeatureType.OTHER]: t('Anden zone'),
	};

	const heightTypeTranslations = {
		[EHeightType.AGL]: t('Over terræn (AGL)'),
		[EHeightType.AMSL]: t('Over havet (AMSL)'),
	};

	const heightTypes = Object.keys(heightTypeTranslations).map((item) => {
		return { value: item, label: heightTypeTranslations[item as EHeightType] };
	});

	const types = Object.keys(typeTranslations).map((item) => {
		return { value: item, label: typeTranslations[item as EOperationGeoDataFeatureType] };
	});

	const getData = useCallback(() => {
		return draw.getAll().features as IOperationGeoDataFeature[];
	}, [getMapState, draw]);

	//Set values to form when item is active
	useEffect(() => {
		if (activeItem) {
			form.setFieldsValue(activeItem.properties);
		} else {
			handleOnClose();
		}
	}, [activeItem]);

	//Handles resize of map in view
	useEffect(() => handleResize(), [getMapState]);
	const handleResize = () => {
		if (getMapState?.mapComponent) {
			getMapState.mapComponent.resize();
		}
	};

	//Handles the bounds
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

	//Handles props with features and set the data
	useEffect(() => handleSetData(), [getMapState, props.features]);
	const handleSetData = () => {
		if (getMapState) {
			handleOnClose();
			const features = props.features ? props.features : [];
			handleLabels(getMapState.mapComponent, features);
			draw.set(convertFeatures(features));
		}
	};

	//Handles when map state is ready
	useEffect(() => handleOnReady(), [getMapOnReadyState]);
	const handleOnReady = () => {
		if (getMapOnReadyState && getMapState) {
			//On draw selection changed
			getMapState.mapComponent.on('draw.selectionchange', (evt: TDrawEvt) => handleGeoSelect(evt));

			//On update
			getMapState.mapComponent.on('draw.update', (evt: TDrawEvt) => handleGeoUpdate(evt.target));

			//On create
			getMapState.mapComponent.on('draw.create', (evt: TDrawEvt) => handleAddZone(evt));

			//OnDelete
			getMapState.mapComponent.on('draw.delete', (evt: TDrawEvt) => {
				handleGeoUpdate(evt.target);
				handleOnClose();
			});
		}
	};

	//Handles draw.update evt, and when any other update is made on the drawed zones
	const handleGeoUpdate = (map: mapboxgl.Map) => {
		const features = draw.getAll().features as IOperationGeoDataFeature[];
		handleLabels(map, convertFeatures(features, true, true).features);
	};

	//Handles when event draw.create is called and zone is added
	const handleAddZone = (evt: TDrawEvt) => {
		const featureId = evt.features[0].id;
		if (featureId) {
			Object.keys(defaultZoneValues).map((key) => {
				draw.setFeatureProperty(String(featureId), key, defaultZoneValues[key as keyof IOperationGeoDataFeatureProperties]);
			});
		}
		handleGeoUpdate(evt.target);
	};

	//Handles when a zone is selected with evt. draw.selectionChange
	const handleGeoSelect = (evt: TDrawEvt) => {
		form.resetFields();
		if (evt.features.length === 1) {
			setActive(evt.features[0]);
		} else {
			handleOnClose();
		}
	};

	//Handle close of form in drawer
	const handleOnClose = useCallback(() => {
		form.resetFields();
		onClose();
	}, [form, onClose, draw]);

	//Handles update on props in form on a zone
	const handleUpdateZone = (value: { [key: string]: Record<string | number | symbol, unknown> }) => {
		if (activeItem?.id) {
			const changedKey = Object.keys(value)[0];
			const changedValue = value[changedKey];
			draw.setFeatureProperty(activeItem.id as string, changedKey, changedValue);
			getMapState && handleGeoUpdate(getMapState.mapComponent);
		}
	};

	return (
		<div className={'site-drawer-render-in-current-wrapper'}>
			{renderMapControl}
			<Drawer
				ref={drawerRef}
				title={t('Zone detaljer')}
				disableCancelConfirm
				closable={false}
				mask={false}
				width={'40%'}
				keyboard={false} //Disable keyboard ESC example
				visible={isOpen}
				onClose={handleOnClose}
				renderInDom>
				<Antd.Form<IOperationGeoDataFeatureProperties>
					labelAlign={'left'}
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 14 }}
					form={form}
					initialValues={{}}
					// eslint-disable-next-line @typescript-eslint/naming-convention
					onValuesChange={handleUpdateZone}>
					<Form.TextInput name={'name'} label={t('Navn')} required />
					<Form.Select name={'type'} label={t('Type')} placeholder={t('Vælg type')} data={types} required />
					<Form.MultiInput
						select={{ name: 'minHeightType', data: heightTypes }}
						numberInput={{ name: 'minHeightValue' }}
						label={t('Min. højde (m)')}
						required
					/>
					<Form.MultiInput
						select={{ name: 'maxHeightType', data: heightTypes }}
						numberInput={{ name: 'maxHeightValue' }}
						label={t('Max. højde (m)')}
						required
					/>
					<Form.ColorPicker name={'color'} label={t('Farve')} />
					<Form.TextInput name={'notes'} label={t('Noter')} multiline />
					{/*
					<ExtraZoneInput
						value={{ name: 'test', label: 'Tillæg' }}
						type={{ name: 'tet2', label: 'Type', data: types }}
						name={'extraZones'}
						label={t('Tillægszoner')}
					/>*/}
				</Antd.Form>
			</Drawer>
		</div>
	);
});
