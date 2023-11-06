import { ColumnsType } from 'antd/lib/table/interface';
import React from 'react';
import { EIconTypes, Icon } from '@naviair-utm/react-shared-components';
import { ILayer, ILayerNotam } from './InfoBoxTypes';
import { TFunction } from 'react-i18next';
import { INotamResponse, ITileExt } from '@naviair-utm/node-shared-interfaces';
import { faLayerGroup } from '@fortawesome/pro-solid-svg-icons/faLayerGroup';
import { faInfoCircle } from '@fortawesome/pro-solid-svg-icons/faInfoCircle';

//const Infinity = () => <div>&infin;</div>;

export const infoList = (t: TFunction<'translations'>): ColumnsType<ILayer> => {
	return [
		{
			width: 30,
			dataIndex: 'properties',
			align: 'center',
			key: 'properties',
			render: (value, row) => {
				return (
					<div className={'tableInfoListIcon'}>
						<Icon name={'layer-group'} icon={faLayerGroup} type={EIconTypes.SOLID} color={`rgba(${row.color},1)`} />
					</div>
				);
			},
			shouldCellUpdate: (record, prevRecord) => record.type === prevRecord.type,
		},
		{
			title: () => {
				return t('Navn');
			},
			dataIndex: 'properties',
			key: 'properties',
			width: 175,
			render: (value: ITileExt | ILayerNotam, row) => {
				if (row.type === 'notam') {
					const valueTyped = value as ILayerNotam;
					return valueTyped.name ? String(valueTyped.name).toLocaleUpperCase() : '';
				} else {
					const valueTyped = value as ITileExt;
					return valueTyped.title ? valueTyped.title : '';
				}
			},
		},
		{
			title: 'Type',
			dataIndex: 'properties',
			key: 'properties',
			width: 175,
			render: (value: ITileExt | ILayerNotam, row) => {
				if (row.type === 'notam') {
					const valueTyped = value as ILayerNotam;
					return valueTyped.type ? t(valueTyped.type) : '';
				} else {
					const valueTyped = value as ITileExt;
					return valueTyped.typeId ? t(valueTyped.typeId) : '';
				}
			},
		},
		{
			width: 30,
			dataIndex: 'properties',
			align: 'center',
			key: 'properties',
			render: (value, row) => {
				if (row.type === 'notam') {
					const typedValue = value as ILayerNotam;
					const notamsJson: INotamResponse[] = JSON.parse(typedValue.notams);
					if (notamsJson.length > 0) {
						return (
							<div className={'tableInfoListInfo'}>
								<Icon name={'info-circle'} icon={faInfoCircle} type={EIconTypes.SOLID} className={'infoCircle'} />
							</div>
						);
					}
				}
			},
			shouldCellUpdate: (record, prevRecord) => record.type === prevRecord.type,
		},
	];
};
