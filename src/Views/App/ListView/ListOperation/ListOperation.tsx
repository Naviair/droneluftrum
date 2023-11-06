import { EOperationStatus, IOperation, IOperationDetails, IOperationGeoDataFeature, IWeatherWeek, TEquiment } from '@naviair-utm/node-shared-interfaces';
import { ColumnsType } from 'antd/lib/table';
import React, { createRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DetailsView, RulesView, WeatherView } from '../..';
import { IDetailsViewFormData, IDetailsViewRef, IRuleItemProps } from '../../OperationPlanning';
import { Antd, Table } from '../../../../Components/Common';
import './styles.scss';
import { getWeatherForecast, getWeatherCurrent } from '../../../../Api/backendServices';
import { IMapViewOperationRef, MapViewOperation } from '../../OperationPlanning/MapViewOperation';
import { fbAuth } from '../../../../Firebase';
import { equipmentApiHook, operationsApiHook } from '../../../../Api';
import moment, { Moment } from 'moment-timezone';
import { useModalState } from '../../../../Hooks';
import * as turf from '@turf/turf';
import { convertFeatures } from './ListOperationHelpers';
import { ruleGenerator } from './ruleGenerator';
import { formatDate, generatePDF } from './generatePDF';
import { pdf } from '@react-pdf/renderer';

const concatCell = (title: string, subTitle?: string) => {
	return (
		<div>
			<div>{title}</div>
			<div className={'concatCell'}>{subTitle}</div>
		</div>
	);
};
interface IListItemProps {
	pageName: string;
}

export const ListOperation: React.FC<IListItemProps> = (props) => {
	const [t] = useTranslation('translations');
	const [, , , , , getUserToken] = fbAuth();
	const [getLoadingState, setLoadingState] = useState<boolean>(true);
	const [getUserTokenState, setUserTokenState] = useState<string>();
	const [getOperationState, setOperationState] = useState<IOperation[]>([]);
	const { getOperations, createOperation, editOperation, deleteOperation } = operationsApiHook(getUserToken);
	const { getEquipment } = equipmentApiHook(getUserToken);
	const [getFilteredState, setFilteredState] = useState<IOperation[]>([]);
	const [getFilter, setFilter] = useState<string>('');
	const [getEquipmentState, setEquipmentState] = useState<TEquiment[]>([]);
	const detailsViewRef = createRef<IDetailsViewRef>();
	const { isOpen, onOpen, onClose, setActive, activeItem } = useModalState<IOperation>();
	const [getFeaturesState, setFeaturesState] = useState<IOperationGeoDataFeature[]>([]);
	const [getBboxState, setBboxState] = useState<turf.helpers.BBox>();
	const [weatherData, setWeatherData] = useState<{ forecast?: IWeatherWeek; location?: string }>();
	const mapViewOperationRef = createRef<IMapViewOperationRef>();
	const [getRulesState, setRulesState] = useState<{ loading: boolean; data: IRuleItemProps[] }>({ loading: false, data: [] });

	const statusTranslations = {
		[EOperationStatus.DRAFT]: t('Udkast'),
		[EOperationStatus.HISTORIC]: t('Historisk'),
		[EOperationStatus.PLANNED]: t('Planlagt'),
	};

	useEffect(() => {
		getUserToken && setUserTokenState(getUserToken);
	}, [getUserToken]);

	useEffect(() => {
		getUserToken && handleGet();
	}, [getUserTokenState]);

	//Get info about center
	useEffect(() => {
		if (getFeaturesState.length > 0) {
			const featureCollection = convertFeatures(getFeaturesState, true) as turf.AllGeoJSON;
			const center = turf.center(featureCollection).geometry?.coordinates;
			const bbox = turf.bbox(featureCollection);
			setBboxState(bbox);
			if ((center?.[1], center?.[0])) {
				getWeather(center[1], center[0]);
			}
		} else {
			setBboxState(undefined);
			setWeatherData(undefined);
		}
	}, [getFeaturesState]);

	useEffect(() => {
		//Search on name
		setFilteredState(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			getOperationState?.filter((item) => {
				if (String(item.name).toUpperCase().includes(getFilter.toUpperCase())) {
					return item;
				}
			})
		);
	}, [getOperationState, getFilter]);

	//Handle change of active item, and set geoZones
	/*useEffect(() => {
		
	}, [activeItem]);*/

	const getWeather = (lat: number, lng: number) => {
		getWeatherCurrent(lat, lng).then((current) => {
			getWeatherForecast(lat, lng, 'da').then((result) => {
				setWeatherData({ forecast: result, location: current.name });
			});
		});
	};

	const handleOnReset = () => {
		onClose();
		detailsViewRef.current?.clear();
		setRulesState({ data: [], loading: false });
		setBboxState(undefined);
		setFeaturesState([]);
	};

	const convertFromDetailsData = (data: IDetailsViewFormData): IOperationDetails => {
		return {
			...data,
			period: {
				startDate: data.period[0].toDate(),
				endDate: data.period[1].toDate(),
			},
			equipment: getEquipmentState.filter((equipment) => equipment._id && data.equipment.includes(equipment._id)),
		};
	};

	const convertToDetailsData = (data?: IOperationDetails): IDetailsViewFormData | undefined => {
		if (data) {
			return {
				...data,
				period: [moment(data.period.startDate), moment(data.period.endDate)],
				equipment: data.equipment.map((equipment) => equipment._id) as string[],
			};
		} else {
			return undefined;
		}
	};

	const handleAdd = (operation: IOperation): Promise<void> => {
		return new Promise((resolve, reject) => {
			detailsViewRef.current
				?.validate()
				.then((operationDetails) => {
					createOperation({ ...operation, ...convertFromDetailsData(operationDetails), geoData: convertFeatures(getFeaturesState, true) })
						.then((operations) => {
							setOperationState(operations);
							resolve();
						})
						.catch((err) => reject(err));
				})
				.catch(() => reject(t('Udfyld venligst alle påkrævede felter')));
		});
	};

	const handleEdit = (operation: IOperation): Promise<void> => {
		return new Promise((resolve, reject) => {
			detailsViewRef.current
				?.validate()
				.then((operationDetails) => {
					editOperation({ ...operation, ...convertFromDetailsData(operationDetails), geoData: convertFeatures(getFeaturesState) })
						.then((operations) => {
							setOperationState(operations);
							resolve();
						})
						.catch((err) => reject(err));
				})
				.catch(() => reject(t('Udfyld venligst alle påkrævede felter')));
		});
	};

	const handleGet = () => {
		getOperations().then((operation) => {
			setOperationState(operation);
			getEquipment().then((equipment) => {
				setEquipmentState(equipment);
				setLoadingState(false);
			});
		});
	};

	const handleDelete = (id: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			setLoadingState(true);
			deleteOperation(id)
				.then((operations) => {
					setOperationState(operations);
					resolve();
				})
				.catch((err) => reject(err))
				.finally(() => setLoadingState(false));
		});
	};

	const handleActiveChange = (operation?: IOperation) => {
		if (operation) {
			setActive(operation);
		} else {
			onClose();
		}
		if (operation?.geoData?.features) {
			setFeaturesState(operation.geoData.features);
		} else {
			setFeaturesState([]);
		}
	};

	const handleZoneRuleUpdate = (zones: mapboxgl.MapboxGeoJSONFeature[], loading: boolean) => {
		setRulesState({ data: ruleGenerator(zones, getFeaturesState, t), loading: loading });
	};

	// Display formatted duration in hours and minutes
	const displayDuration = (start: Moment, end: Moment): string => {
		const durationHours = end.diff(start, 'hours');
		const durationMinutes = end.diff(start, 'minutes') - durationHours * 60;
		const hoursStr = durationHours === 1 ? `${durationHours} ${t('time')}` : `${durationHours} ${t('timer')}`;
		let minutesStr = durationMinutes === 1 ? `, ${durationMinutes} ${t('minut')}` : `, ${durationMinutes} ${t('minutter')}`;
		if (durationMinutes === 0) {
			minutesStr = '';
		}
		return hoursStr + minutesStr;
	};

	const handleDownload = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			try {
				if (mapViewOperationRef.current && activeItem && !getRulesState.loading) {
					const updated = formatDate(activeItem.lastUpdated ? activeItem.lastUpdated : activeItem.created);
					const documentTitle = `Drone Operationsplan - ${activeItem.name} - ${updated}.pdf`;
					mapViewOperationRef.current
						.getCanvas()
						?.then((imageDataUrl) => {
							pdf(generatePDF(activeItem, imageDataUrl, getRulesState.data))
								.toBlob()
								.then((pdfBlob) => {
									const blobURL = window.URL.createObjectURL(pdfBlob);
									const tempLink = document.createElement('a');
									tempLink.href = blobURL;
									tempLink.setAttribute('download', documentTitle);
									tempLink.click();
								});
						})
						.catch((err) => reject(err))
						.finally(() => resolve());
				} else {
					reject(t('Download ikke muligt, prøv igen om lidt'));
				}
			} catch (err) {
				reject(err);
			}
		});
	};

	const columns: ColumnsType<IOperation> = [
		{
			title: t('Status'),
			dataIndex: 'status',
			sorter: {
				compare: (a, b) => a.status.localeCompare(b.status),
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			render: (value) => {
				return <Antd.Tag>{statusTranslations[value as EOperationStatus].toUpperCase()}</Antd.Tag>;
			},
		},
		{
			title: t('Operationsnavn'),
			dataIndex: 'name',
			sorter: {
				compare: (a, b) => a.name.localeCompare(b.name),
			},
			render: (value, row) => {
				return concatCell(value, `${row.notes ? `${row.notes} ` : ''}`);
			},
		},
		{
			title: t('Periode'),
			dataIndex: 'period',
			sorter: {
				compare: (a, b) => moment(a.period.startDate).unix() - moment(b.period.startDate).unix(),
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			render: (_value, row) => {
				const startMoment = moment(row.period.startDate).startOf('minute');
				const endMoment = moment(row.period.endDate).startOf('minute');
				if (startMoment.isSame(endMoment, 'day')) {
					return concatCell(
						`${startMoment.format('DD-MM-YYYY')}`,
						`${startMoment.format('HH:mm')} - ${endMoment.format('HH:mm')} (${displayDuration(startMoment, endMoment)})`
					);
				} else {
					return concatCell(
						`${startMoment.format('DD-MM-YYYY')} - ${endMoment.format('DD-MM-YYYY')}`,
						`${startMoment.format('DD-MM-YYYY HH:mm')} - ${endMoment.format('DD-MM-YYYY HH:mm')} (${displayDuration(startMoment, endMoment)})`
					);
				}
			},
		},
		{
			title: t('Udstyr'),
			dataIndex: 'equipment',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			render: (_value, row) => {
				return row.equipment.map((equipment) => <Antd.Tag key={equipment._id}>{equipment.name.toUpperCase()}</Antd.Tag>);
			},
		},
	];

	return (
		//TODO: Wrap Config provider around this when danish translations approved
		<>
			<Table<IOperation>
				formData={<></>}
				typeTranslations={statusTranslations}
				typeFilter
				typeFilterField={'status'}
				columns={columns}
				dataSource={getFilteredState}
				fullscreen
				onDownloadClick={handleDownload}
				loading={getLoadingState}
				onUpdate={handleEdit}
				onAdd={handleAdd}
				onSearch={setFilter}
				onDelete={handleDelete}
				onActiveItemChange={handleActiveChange}
				onFormReset={handleOnReset}
				pageName={props.pageName}
				dependencies={{
					length: getEquipmentState.length,
					noMobile: true,
				}}>
				<Antd.Row>
					<Antd.Col span={12} className={'operationLeftCol'}>
						<MapViewOperation
							ref={mapViewOperationRef}
							onSave={setFeaturesState}
							features={getFeaturesState}
							bounds={getBboxState}
							onZoneRulesUpdate={handleZoneRuleUpdate}
						/>
					</Antd.Col>
					<Antd.Col span={12} className={'operationRightCol'}>
						<DetailsView ref={detailsViewRef} equipment={getEquipmentState} data={convertToDetailsData(activeItem) as IDetailsViewFormData} />
						<WeatherView data={weatherData?.forecast} location={weatherData?.location} />
						<RulesView data={getRulesState.data} loading={getRulesState.loading} />
					</Antd.Col>
				</Antd.Row>
			</Table>
		</>
	);
};
