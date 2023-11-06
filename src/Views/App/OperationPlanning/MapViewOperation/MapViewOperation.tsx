import { EditOutlined } from '@ant-design/icons';
import { IOperationGeoDataFeature, IOperationGeoDataFeatureProperties } from '@naviair-utm/node-shared-interfaces';
import React, { createRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Antd, IMapControlEditRef, IMapControlReadOnlyRef, MapControlEdit, MapControlReadOnly } from '../../../../Components';
import { Drawer } from '@naviair-utm/react-shared-components';
import './styles.scss';
import * as turf from '@turf/turf';

interface IOperationGeoDataFeaturePropertiesWithLabel extends IOperationGeoDataFeatureProperties {
	labelHeader: string;
	labelContent: string;
}
export interface IOperationGeoDataFeatureWithLabel extends IOperationGeoDataFeature {
	properties: IOperationGeoDataFeaturePropertiesWithLabel;
}

interface IMapViewOperationProps {
	onSave: (features: IOperationGeoDataFeature[]) => void;
	features?: IOperationGeoDataFeature[];
	bounds?: turf.helpers.BBox;
	onZoneRulesUpdate?: (zones: mapboxgl.MapboxGeoJSONFeature[], loading: boolean) => void;
}

export interface IMapViewOperationRef {
	getCanvas: () => Promise<string> | undefined;
}

export const MapViewOperation = forwardRef<IMapViewOperationRef, React.PropsWithChildren<IMapViewOperationProps>>((props, ref) => {
	const [getShowEditMap, setShowEditMap] = useState<boolean>(false);
	const mapControlEditRef = createRef<IMapControlEditRef>();
	const mapControlReadOnlyRef = createRef<IMapControlReadOnlyRef>();
	const [t] = useTranslation('translations');

	useImperativeHandle(ref, () => ({
		getCanvas(): Promise<string> | undefined {
			return mapControlReadOnlyRef.current?.getCanvas();
		},
	}));

	const onClose = () => {
		mapControlEditRef.current?.cancel();
		setShowEditMap(false);
	};

	const onOpen = () => {
		setShowEditMap(true);
	};

	const handleSave = () => {
		const features = mapControlEditRef.current?.submit();
		props.onSave(features ? features : []);
	};

	return (
		<Antd.Card
			className={'mapViewOperationCard'}
			size={'small'}
			title={t('Område')}
			extra={
				<span className={'cardEditButton'}>
					<Antd.Button size={'small'} onClick={onOpen} icon={<EditOutlined />} type={'primary'}>
						{t('Rediger')}
					</Antd.Button>
				</span>
			}>
			<div className={'operationMap'}>
				<MapControlReadOnly ref={mapControlReadOnlyRef} bounds={props.bounds} features={props.features} onZoneRulesUpdate={props.onZoneRulesUpdate} />
				<Drawer visible={getShowEditMap} onClose={onClose} standardFooter onSave={handleSave} closable={false} push={false} width={'100%'}>
					<MapControlEdit ref={mapControlEditRef} bounds={props.bounds} features={props.features} />
				</Drawer>
			</div>
		</Antd.Card>
	);
});
