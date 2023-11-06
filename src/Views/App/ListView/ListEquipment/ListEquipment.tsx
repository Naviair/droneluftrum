import {
	EEquipmentDroneType,
	EEquipmentDroneWeight,
	EEquipmentTrackerType,
	EEquipmentType,
	IEquipment,
	TEquiment,
	EEquipmentOperatorCertificate,
} from '@naviair-utm/node-shared-interfaces';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { equipmentApiHook } from '../../../../Api';
import { Antd, Table, Form } from '../../../../Components/Common';
import { fbAuth } from '../../../../Firebase';
import './styles.scss';

const concatCell = (title: string, subTitle?: string) => {
	return (
		<div>
			<div>{title}</div>
			<div className={'concatCell'}>{subTitle}</div>
		</div>
	);
};

interface IListEquipmentProps {
	pageName: string;
}

export const ListEquipment: React.FC<IListEquipmentProps> = (props) => {
	const [t] = useTranslation('translations');
	const [getTypeS, setTypeS] = useState<EEquipmentType>();
	const [, , , , , getUserToken] = fbAuth();
	const [getLoadingState, setLoadingState] = useState<boolean>(true);
	const [getUserTokenState, setUserTokenState] = useState<string>();
	const [getEquipmentState, setEquipmentState] = useState<TEquiment[]>([]);
	const { getEquipment, createEquipment, editEquipment, deleteEquipment } = equipmentApiHook(getUserToken);
	const [getFilteredState, setFilteredState] = useState<TEquiment[]>([]);
	const [getFilter, setFilter] = useState<string>('');

	useEffect(() => {
		//Search on name and sn
		setFilteredState(
			getEquipmentState.filter((item) => {
				if (String(item.name).toUpperCase().includes(getFilter.toUpperCase())) {
					return item;
				}
			})
		);
	}, [getEquipmentState, getFilter]);

	useEffect(() => {
		getUserToken && setUserTokenState(getUserToken);
	}, [getUserToken]);

	useEffect(() => {
		getUserToken && handleGet();
	}, [getUserTokenState]);

	const typeTranslations = {
		[EEquipmentType.DRONE]: t('Drone'),
		[EEquipmentType.CONTROLLER]: t('Controller'),
		[EEquipmentType.TRACKER]: t('Tracker'),
		[EEquipmentType.OPERATOR]: t('Operatør'),
	};

	const droneTypeTranslations = {
		[EEquipmentDroneType.MULTI_ROTOR]: t('Multirotor'),
		[EEquipmentDroneType.FIXED_WING]: t('Fastvinget'),
		[EEquipmentDroneType.SINGLE_ROTOR]: t('Enkelt rotor'),
		[EEquipmentDroneType.FIXED_WING_HYBRID]: t('Fastvinget hybrid'),
	};

	const droneWeightTranslations = {
		[EEquipmentDroneWeight.LEGACY_000_005]: t('Legacy 0,00 - 0,50 kg'),
		[EEquipmentDroneWeight.LEGACY_005_020]: t('Legacy 0,50 - 2,00 kg'),
		[EEquipmentDroneWeight.LEGACY_020_250]: t('Legacy 2,00 - 25,00 kg'),
		[EEquipmentDroneWeight.C0]: `C0 - ${t('Under')} 0,25 kg`,
		[EEquipmentDroneWeight.C1]: `C1 - ${t('Under')} 0,90 kg`,
		[EEquipmentDroneWeight.C2]: `C2 - ${t('Under')} 4,00 kg`,
		[EEquipmentDroneWeight.C3]: `C3 - ${t('Under')} 25,00 kg`,
	};

	const trackerTypeTranslations = {
		[EEquipmentTrackerType.ADS_B]: t('ADS-B'),
		[EEquipmentTrackerType.FLARM_OGN]: t('FLARM/OGN'),
		[EEquipmentTrackerType.REMOTE_ID]: t('RemoteID'),
		[EEquipmentTrackerType.OTHER]: t('Andet'),
	};

	const operatorCertificateTranslations = {
		[EEquipmentOperatorCertificate.A1_A3]: t('A1/3'),
		[EEquipmentOperatorCertificate.A2]: t('A2'),
		[EEquipmentOperatorCertificate.DK_STS_03]: t('DK-STS-03'),
		[EEquipmentOperatorCertificate.STS_01]: t('STS-01'),
		[EEquipmentOperatorCertificate.STS_02]: t('STS-02'),
	};

	const handleAdd = (equipment: TEquiment): Promise<void> => {
		return new Promise((resolve, reject) => {
			createEquipment(equipment)
				.then((equipments) => {
					setEquipmentState(equipments);
					resolve();
				})
				.catch((err) => reject(err));
		});
	};

	const handleEdit = (equipment: TEquiment): Promise<void> => {
		return new Promise((resolve, reject) => {
			editEquipment(equipment)
				.then((equipments) => {
					setEquipmentState(equipments);
					resolve();
				})
				.catch((err) => reject(err));
		});
	};

	const handleGet = () => {
		getEquipment().then((equipments) => {
			setEquipmentState(equipments);
			setLoadingState(false);
		});
	};

	const handleDelete = (id: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			setLoadingState(true);
			deleteEquipment(id)
				.then((equipments) => {
					setEquipmentState(equipments);
					resolve();
				})
				.catch((err) => reject(err))
				.finally(() => setLoadingState(false));
		});
	};

	const handleResetForm = (): void => {
		setTypeS(undefined);
	};

	const formData = (type?: EEquipmentType): JSX.Element => {
		return (
			<>
				<Form.TextInput name={'name'} label={t('Navn')} required />
				<Form.Select
					name={'type'}
					label={t('Type')}
					placeholder={t('Vælg udstyrstype')}
					onChange={(value) => setTypeS(value?.toString() as EEquipmentType)}
					data={Object.keys(typeTranslations).map((item) => {
						return { value: item, label: typeTranslations[item as EEquipmentType] };
					})}
					required
				/>
				{type === EEquipmentType.OPERATOR && (
					<>
						<Form.TextInput name={'phone'} label={'Telefon'} />
						<Form.TextInput name={'certificateId'} label={t('Certifikat ID')} />
						<Form.Select
							name={'certificates'}
							label={t('Certifikater')}
							placeholder={t('Vælg type')}
							data={Object.keys(EEquipmentOperatorCertificate).map((item) => {
								return { value: item, label: operatorCertificateTranslations[item as EEquipmentOperatorCertificate] };
							})}
							multiselect
						/>
					</>
				)}

				{type !== undefined && type !== EEquipmentType.OPERATOR && (
					<>
						<Form.TextInput name={'sn'} label={t('Serienummer')} />
						<Form.TextInput name={'manufacturer'} label={t('Producent')} />
						<Form.TextInput name={'model'} label={t('Model')} />
					</>
				)}

				{type === EEquipmentType.DRONE && (
					<>
						<Form.Select
							name={'droneType'}
							label={t('Dronetype')}
							placeholder={t('Vælg dronetype')}
							data={Object.keys(droneTypeTranslations).map((item) => {
								return { value: item, label: droneTypeTranslations[item as EEquipmentDroneType] };
							})}
							required
						/>
						<Form.Select
							name={'droneWeight'}
							label={t('Vægtklasse')}
							placeholder={t('Vælg vægtklasse')}
							data={Object.keys(droneWeightTranslations).map((item) => {
								return { value: item, label: droneWeightTranslations[item as EEquipmentDroneWeight] };
							})}
							required
						/>
					</>
				)}
				{type === EEquipmentType.TRACKER && (
					<>
						<Form.Select
							name={'trackerType'}
							label={t('Tracker type')}
							placeholder={t('Vælg tracker type')}
							data={Object.keys(trackerTypeTranslations).map((item) => {
								return { value: item, label: trackerTypeTranslations[item as EEquipmentTrackerType] };
							})}
							required
						/>
						<Form.TextInput name={'trackerId'} label={t('Tracker ID')} />
						<Form.TextInput name={'icaoAddress'} label={t('ICAO adresse')} />
						<Form.TextInput name={'callSign'} label={t('CallSign')} />
					</>
				)}

				<Form.TextInput name={'notes'} label={t('Noter')} multiline />
			</>
		);
	};

	const columns: ColumnsType<IEquipment> = [
		{
			title: t('Udstyr'),
			dataIndex: 'name',
			sorter: {
				compare: (a, b) => a.name.localeCompare(b.name),
			},
			render: (value, row) => {
				return concatCell(value, `${row.manufacturer ? `${row.manufacturer} ` : ''}${row.model ? row.model : ''}`);
			},
		},
		{
			title: t('Serienummer'),
			dataIndex: 'sn',
		},
		{
			title: t('Type'),
			dataIndex: 'type',
			sorter: {
				compare: (a, b) => a.type.localeCompare(b.type),
			},
			render: (value: EEquipmentType) => {
				return <Antd.Tag key={value}>{typeTranslations[value].toUpperCase()}</Antd.Tag>;
			},
		},
	];

	return (
		<Table<TEquiment>
			formData={formData(getTypeS)}
			typeTranslations={typeTranslations}
			typeFilter
			typeFilterField={'type'}
			columns={columns}
			dataSource={getFilteredState}
			onAdd={handleAdd}
			onUpdate={handleEdit}
			onActiveItemChange={(activeItem) => setTypeS(activeItem?.type)}
			onFormReset={() => handleResetForm}
			loading={getLoadingState}
			onDelete={handleDelete}
			onSearch={setFilter}
			pageName={props.pageName}
		/>
	);
};
