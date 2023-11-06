import { Antd } from '../../Common/Antd';
import React, { useEffect, useState } from 'react';
import { infoList } from './listTemplates';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { IGeo, ILatLng, IWeather, EScreenType, INotam, IAftnMessage, ENotamFields } from '@naviair-utm/node-shared-interfaces';
import './styles.scss';
import { InfoboxHeader } from './InfoBoxHeader';
import { ILayer, parseFeatures, ILayerNotam } from './InfoBoxTypes';
import moment from 'moment-timezone';
import { formatDateTime, formatLimits, getColor } from '../Notam/notamHelpers';
import { useTranslation } from 'react-i18next';
import { Modal, Skeleton } from '@naviair-utm/react-shared-components';

/**
 * @param latLng Latitude longitude values @see ILatLng
 * @param features mapBox Geojson features
 * @param geoInfo Further information about geolocation @see IGeo
 * @param show Set show for infobox
 * @param onClose Set onclose event for infobox
 * @param headerContent Set headerContent for infobox
 */

export interface IInfoBox {
	latLng?: ILatLng | undefined;
	features?: mapboxgl.MapboxGeoJSONFeature[];
	geoInfo?: IGeo<IWeather> | undefined;
	show: boolean;
	onClose: () => void;
	headerContent: JSX.Element;
	bodyContent?: JSX.Element;
}

export const InfoBox: React.FC<IInfoBox> = (props) => {
	const [getNotamState, setNotamState] = useState<IAftnMessage<INotam>[]>([]);
	const [getLayersState, setLayersState] = useState<ILayer[]>();
	const [getLoadingState, setLoadingState] = useState<boolean>(false);
	const [getNotamModalRecordState, setNotamModalRecordState] = useState<ILayer>();
	const [getNotamModalState, setNotamModalState] = useState<boolean>(false);
	const [getRecordPropState, setRecordPropState] = useState<ILayerNotam>();
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	const getLayerRAState = useRecoilValue(Recoil.MapLayerGroup.Atom);
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const curTilesets = configuration.settings.map.layers[getLayerRAState];
	const [t] = useTranslation('translations');

	useEffect(() => {
		setLoadingState(true);
		parseFeatures(props.features, curTilesets)
			.then((layers) => {
				/**
				 * TODO: THIS LINE MAKES ERROR IN CONSOLE
				 */
				setLayersState(layers);
			})
			.finally(() => setLoadingState(false));
	}, [props.features, curTilesets]);

	useEffect(() => {
		try {
			if (getNotamModalRecordState) {
				const recordProps = getNotamModalRecordState.properties as ILayerNotam;
				const notams: IAftnMessage<INotam>[] = JSON.parse(recordProps.notams);
				setRecordPropState(recordProps);
				setNotamState(notams);
			}
		} catch (error) {
			//console.log(error);
		}
	}, [getNotamModalRecordState]);

	return props.show ? (
		getLoadingState ? (
			<Skeleton
				backgroundColor={'#f9f9f9'}
				foregroundColor={'#96ae09'}
				speed={0.7}
				className={screenTypeS === EScreenType.MOBILE ? 'info_box_mobile_skeleton' : 'info_box_skeleton'}
				lines={
					screenTypeS === EScreenType.MOBILE
						? [
								{ leftMarg: '50', topMarg: '32', width: '200', height: '6' },
								{ leftMarg: '50', topMarg: '44', width: '360', height: '6' },
								{ leftMarg: '50', topMarg: '56', width: '360', height: '6' },
								{ leftMarg: '50', topMarg: '68', width: '360', height: '6' },
						  ]
						: [
								{ leftMarg: '50', topMarg: '20', width: '160', height: '6' },
								{ leftMarg: '50', topMarg: '32', width: '360', height: '6' },
								{ leftMarg: '50', topMarg: '44', width: '360', height: '6' },
						  ]
				}
			/>
		) : (
			<div className={screenTypeS === EScreenType.MOBILE ? 'info_box_mobile' : 'info_box'}>
				<InfoboxHeader onClose={props.onClose} geoInfo={props.geoInfo} latLng={props.latLng} headerContent={props.headerContent} />

				<div className={'content'} hidden={getLayersState && getLayersState.length > 0 ? false : true}>
					<Antd.Table
						size={'small'}
						onRow={(record) => {
							return {
								onClick: () => {
									if (record.type === 'notam') {
										const typedProperties = record.properties as ILayerNotam;
										const notamsJson: IAftnMessage<INotam>[] = JSON.parse(typedProperties.notams);
										if (notamsJson.length > 0) {
											setNotamModalRecordState(record);
											setNotamModalState(true);
										}
									}
								},
							};
						}}
						rowKey={(record) => record.key}
						pagination={false}
						columns={infoList(t)}
						dataSource={getLayersState}
					/>
				</div>

				<Modal draggable={true} footer={null} onClose={() => setNotamModalState(false)} visible={getNotamModalState} title={getRecordPropState?.name}>
					<Antd.Collapse defaultActiveKey={['notam_0']} expandIconPosition={'right'} accordion>
						{getNotamState
							.sort((a, b) => {
								const momentStartA = moment(a.parsedMessage.schedule?.activityStart).unix();
								const momentStartB = moment(b.parsedMessage.schedule?.activityStart).unix();
								return momentStartA - momentStartB;
							})
							.map((notam, index) => {
								const momentStart = moment(notam.parsedMessage.schedule?.activityStart);
								const momentEnd = moment(notam.parsedMessage.schedule?.validityEnd);
								const notamRepeatSchedule = parseNotamSchedule(notam);
								return (
									<Antd.Panel
										header={`${notam.parsedMessage.qualification?.code?.subArea} (${notam.parsedMessage.header?.id})`}
										// eslint-disable-next-line react/forbid-component-props
										style={{ backgroundColor: `rgba(${getColor(momentStart, momentEnd, notam.parsedMessage.qualification?.code?.code)},1)` }}
										key={`notam_${index}`}>
										<Antd.Descriptions column={1}>
											<Antd.Descriptions.Item label={t('Aktiv')}>
												{formatDateTime(momentStart)} {t('til')} {formatDateTime(momentEnd)}
											</Antd.Descriptions.Item>

											{notamRepeatSchedule && (
												<Antd.Descriptions.Item label={t('Repetitiv')}>
													{'DAILY'} {moment(notamRepeatSchedule.start.toDate()).format('HH:mm zz')} {t('til')}{' '}
													{moment(notamRepeatSchedule.end.toDate()).format('HH:mm zz')}
												</Antd.Descriptions.Item>
											)}

											<Antd.Descriptions.Item label={t('Højde')}>
												{formatLimits(notam.parsedMessage.limits?.lower)} {t('til')} {formatLimits(notam.parsedMessage.limits?.upper)}
											</Antd.Descriptions.Item>
											<Antd.Descriptions.Item>{notam.parsedMessage.content?.text}</Antd.Descriptions.Item>
										</Antd.Descriptions>
									</Antd.Panel>
								);
							})}
					</Antd.Collapse>
				</Modal>
			</div>
		)
	) : (
		<></>
	);
};

export interface INotamRepeatSchedule {
	start: moment.Moment;
	end: moment.Moment;
	frequency: string; // For now only possible value is "DAILY"
}

/**
 * Searches for DAILY xxxx-yyyy and captures the xxxx and yyyy in two groups named "start" and "end"
 */
const notamScheduleRegex = /DAILY (?<start>\d{4})-(?<end>\d{4})/gm;

/**
 * Parse the repeat schedule of a notam. Will look ik rawFields.d for a schedule in the format "DAILY xxxx-yyyy" and will return 'undefined' if not matched.
 * @param notam A parsed notam message @see IAftnMessage
 * @returns @see INotamRepeatSchedule or undefined if not found
 */
const parseNotamSchedule = (notam: IAftnMessage<INotam>): INotamRepeatSchedule | undefined => {
	const schedule = notam.parsedMessage.rawFields?.[ENotamFields.d] ? notamScheduleRegex.exec(notam.parsedMessage.rawFields[ENotamFields.d]) : null;
	//! Important to "reset" the regex. Will return "null" at next attempt if not reset this way
	notamScheduleRegex.lastIndex = 0;

	// .exec() returns null if not matched
	if (schedule !== null) {
		// Get current timestamp in UTC for generating the year, month and date
		const now = moment.utc();

		// Generate a Moment UTC from an array where the hours and minutes are provided from the regex
		const start = moment.utc([
			now.year(),
			now.month(),
			now.date(),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			parseInt(schedule.groups!.start.substring(0, 2), 10),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			parseInt(schedule.groups!.start.substring(2, 4), 10),
		]);
		const end = moment.utc([
			now.year(),
			now.month(),
			now.date(),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			parseInt(schedule.groups!.end.substring(0, 2), 10),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			parseInt(schedule.groups!.end.substring(2, 4), 10),
		]);

		return {
			start: start,
			end: end,
			frequency: 'DAILY',
		} as INotamRepeatSchedule;
	}

	return undefined;
};
