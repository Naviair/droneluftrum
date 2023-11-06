// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/forbid-component-props */
import React from 'react';
import {
	EEquipmentType,
	IEquipmentController,
	IEquipmentDrone,
	IEquipmentOperator,
	IEquipmentTracker,
	IOperation,
	IOperationGeoDataFeature,
	TEquiment,
} from '@naviair-utm/node-shared-interfaces';
import Logo from '../../../../Assets/Brand/app_logo.png';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import moment from 'moment-timezone';
import { ERuleType, IRuleItemProps } from '../../OperationPlanning';

const styles = StyleSheet.create({
	body: {
		paddingTop: 35,
		paddingBottom: 65,
		paddingHorizontal: 35,
	},
	title: {
		marginTop: 30,
		marginBottom: 10,
		fontSize: 24,
		textAlign: 'center',
	},
	periode: {
		fontSize: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 18,
		margin: 12,
	},
	text: {
		margin: 12,
		fontSize: 14,
		textAlign: 'justify',
	},
	imageLogo: {
		maxHeight: 50,
		objectFit: 'contain',
		height: 'auto',
		width: 'auto',
	},
	imageFrontpage: {
		maxHeight: 500,
		objectFit: 'contain',
		height: 'auto',
		width: 'auto',
	},
	imageArea: {
		objectFit: 'contain',
		height: 'auto',
		width: 'auto',
		maxHeight: 635,
	},
	header: {
		fontSize: 16,
		textAlign: 'center',
		color: 'grey',
		marginBottom: 10,
	},
	lineSplitter: {
		marginTop: 20,
		marginBottom: 20,
		borderTop: 1,
		borderColor: 'gray',
	},
	footer: {
		position: 'absolute',
		bottom: 30,
		left: 0,
		right: 0,
		fontSize: 12,
		color: 'gray',
		flexDirection: 'row',
		textAlign: 'center',
	},
	footerPageNumber: {
		//justifyContent: 'center',
		flex: 1,
		fontSize: 8,
		display: 'flex',
	},
	footerLastUpdated: {
		flex: 1,
		fontSize: 8,
		display: 'flex',
	},
	footerCreated: {
		flex: 1,
		fontSize: 8,
		display: 'flex',
	},
	detailsRow: {
		fontSize: 12,
		flexDirection: 'row',
		textAlign: 'left',
		paddingTop: 10,
		paddingBottom: 10,
	},
	equipmentValueRow: {
		fontSize: 10,
		paddingTop: 5,
		paddingBottom: 5,
		borderBottom: 1,
	},
	equipmentHeader: {
		paddingTop: 10,
		fontSize: 12,
	},
	detailsCol: {
		display: 'flex',
		paddingLeft: 3,
		paddingRight: 3,
		flex: 1,
	},
	detailsColHeader: {
		fontSize: 14,
	},
});

export const formatDate = (date: Date) => moment(date).format('DD-MM-YYYY HH:mm');

export const generatePDF = (operation: IOperation, mapImage?: string, rules?: IRuleItemProps[]) => {
	const created = formatDate(operation.created);
	const updated = formatDate(operation.lastUpdated ? operation.lastUpdated : operation.created);
	const start = formatDate(operation.period.startDate);
	const end = formatDate(operation.period.endDate);
	//Change equipment to object array
	const equipmentObj: { [key in EEquipmentType]?: TEquiment[] } = {};
	operation.equipment.map((equipment) => {
		if (!equipmentObj[equipment.type]) {
			equipmentObj[equipment.type] = [];
		}
		equipmentObj[equipment.type]?.push(equipment);
	});

	const footer = () => (
		<View style={styles.footer} fixed>
			<View style={styles.footerCreated}>
				<Text>{`Oprettet: ${created}`}</Text>
			</View>
			<View style={styles.footerPageNumber}>
				<Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
			</View>
			<View style={styles.footerLastUpdated}>
				<Text>{`Opdateret: ${updated}`}</Text>
			</View>
		</View>
	);

	const lineSplitter = () => <View style={styles.lineSplitter} />;

	const pageTitle = (title: string) => <Text style={styles.header}>{title}</Text>;

	const tableColValue = (value?: string, flex?: number, borderRight?: number, backgroundColor?: string) => (
		<View
			style={{
				...styles.detailsCol,
				flex: flex ? flex : 1,
				borderRight: borderRight ? borderRight : 0,
			}}>
			{backgroundColor ? (
				<Text style={{ backgroundColor: backgroundColor, height: 15, fontSize: 8, padding: '3px, 5px' }}>{value ? value : ''}</Text>
			) : (
				<Text>{value ? value : ''}</Text>
			)}
		</View>
	);
	const tableColValueMultiLine = (values?: string[], flex = 1) => {
		return (
			<View style={{ flex: flex }}>
				{values?.map((value, index) => {
					return <Text key={`multiline${index}`}>{`- ${value}`}</Text>;
				})}
			</View>
		);
	};

	const tableColHeader = (title: string) => (
		<View style={{ ...styles.detailsCol, ...styles.detailsColHeader }}>
			<Text>{`${title}:`}</Text>
		</View>
	);

	const tableRowDetails = (title: string, value?: string) => (
		<View style={styles.detailsRow}>
			{tableColHeader(title)}
			{tableColValue(value, 2)}
		</View>
	);

	const tableHeaderRule = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Type', 0.5)}
			{tableColValue('Titel')}
			{tableColValue('Beskrivelse', 3)}
		</View>
	);

	const tableRowRule = (rule: IRuleItemProps, borderBottom = 1) => {
		const ruleProps = {
			[ERuleType.ERROR]: {
				color: '#ff7875',
				desc: 'RESTRICTION',
			},
			[ERuleType.WARNING]: {
				color: '#ffd666',
				desc: 'WARNING',
			},
			[ERuleType.INFORMATION]: {
				color: '#69c0ff',
				desc: 'INFO',
			},
		};
		return (
			<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
				{tableColValue(ruleProps[rule.type].desc, 0.75, 0, ruleProps[rule.type].color)}
				{tableColValue(rule.title)}
				{tableColValueMultiLine(rule.description, 3)}
			</View>
		);
	};

	const tableHeaderZone = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Farve', 0.5)}
			{tableColValue('Navn')}
			{tableColValue('Type')}
			{tableColValue('Min. højde (m)')}
			{tableColValue('Max. højde (m)')}
			{tableColValue('Radius (m)')}
			{tableColValue('Noter', 2)}
		</View>
	);

	const tableRowZone = (zone: IOperationGeoDataFeature, borderBottom = 1) => {
		const props = zone.properties;
		return (
			<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
				{tableColValue('', 0.5, 0, props.color)}
				{tableColValue(props.name)}
				{tableColValue(props.type)}
				{tableColValue(`${props.minHeightValue} ${props.minHeightType}`)}
				{tableColValue(`${props.maxHeightValue} ${props.maxHeightType}`)}
				{tableColValue(`${props.circleRadius ? Number(props.circleRadius * 1000).toFixed(0) : ''}`)}
				{tableColValue(props.notes, 2)}
			</View>
		);
	};

	const tableHeaderDrone = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Navn')}
			{tableColValue('Serienummer')}
			{tableColValue('Producent')}
			{tableColValue('Model')}
			{tableColValue('Dronetype')}
			{tableColValue('Vægtklasse')}
		</View>
	);

	const tableRowDrone = (drone: TEquiment<IEquipmentDrone>, borderBottom = 1) => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
			{tableColValue(drone.name)}
			{tableColValue(drone.sn)}
			{tableColValue(drone.manufacturer)}
			{tableColValue(drone.model)}
			{tableColValue(drone.droneType)}
			{tableColValue(drone.droneWeight)}
		</View>
	);

	const tableHeaderTracker = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Navn')}
			{tableColValue('Serienummer')}
			{tableColValue('Producent')}
			{tableColValue('Model')}
			{tableColValue('Tracker type')}
			{tableColValue('Tracker ID')}
			{tableColValue('ICAO adresse')}
			{tableColValue('CallSign')}
		</View>
	);

	const tableRowTracker = (drone: TEquiment<IEquipmentTracker>, borderBottom = 1) => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
			{tableColValue(drone.name)}
			{tableColValue(drone.sn)}
			{tableColValue(drone.manufacturer)}
			{tableColValue(drone.model)}
			{tableColValue(drone.trackerType)}
			{tableColValue(drone.trackerId)}
			{tableColValue(drone.icaoAddress)}
			{tableColValue(drone.callSign)}
		</View>
	);

	const tableHeaderController = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Navn')}
			{tableColValue('Serienummer')}
			{tableColValue('Producent')}
			{tableColValue('Model')}
		</View>
	);

	const tableRowController = (drone: TEquiment<IEquipmentController>, borderBottom = 1) => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
			{tableColValue(drone.name)}
			{tableColValue(drone.sn)}
			{tableColValue(drone.manufacturer)}
			{tableColValue(drone.model)}
		</View>
	);

	const tableHeaderOperator = () => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: 2 }} fixed>
			{tableColValue('Navn')}
			{tableColValue('Certifikat ID')}
			{tableColValue('Certifikater')}
		</View>
	);

	const tableRowOperator = (operator: TEquiment<IEquipmentOperator>, borderBottom = 1) => (
		<View style={{ ...styles.detailsRow, ...styles.equipmentValueRow, borderBottom: borderBottom }}>
			{tableColValue(operator.name)}
			{tableColValue(operator.certificateId)}
			{tableColValueMultiLine(operator.certificates, 1)}
		</View>
	);

	return (
		<Document title={`Drone Operationsplan - ${operation.name} - ${updated}`} creator={'Naviair UTM'} producer={'Naviair UTM'}>
			<Page size={'A4'} style={styles.body}>
				{pageTitle('DRONE OPERATIONSPLAN')}
				<Image style={styles.imageLogo} src={Logo} />
				<Text style={styles.title}>{operation.name.toUpperCase()}</Text>
				<Text style={styles.periode}>{`${start} - ${end}`}</Text>
				{lineSplitter()}
				{mapImage && <Image style={styles.imageFrontpage} src={mapImage} />}
				{footer()}
			</Page>
			<Page size={'A4'} style={styles.body}>
				{pageTitle('DETALJER')}
				{lineSplitter()}
				<View>
					{tableRowDetails('Operationsnavn', operation.name)}
					{tableRowDetails('Formål', operation.purpose)}
					{tableRowDetails('Oprettet', created)}
					{tableRowDetails('Opdateret', updated)}
					{tableRowDetails('Operationsperiode', `${start} - ${end}`)}
					{tableRowDetails('Status', operation.status)}
					{tableRowDetails('Noter', operation.notes)}
				</View>
			</Page>
			<Page size={'A4'} style={styles.body} orientation={'landscape'}>
				{pageTitle('UDSTYR')}
				{lineSplitter()}
				<View>
					{Object.keys(equipmentObj).map((key) => {
						const equipmentArr = equipmentObj[key as EEquipmentType];
						{
							return (
								<View key={key} style={{ marginBottom: 10 }}>
									{tableRowDetails(key)}
									{equipmentArr?.map((equipment, index) => {
										if (equipment.type === EEquipmentType.DRONE) {
											return (
												<React.Fragment key={equipment._id}>
													{index === 0 && tableHeaderDrone()}
													{tableRowDrone(equipment as IEquipmentDrone)}
												</React.Fragment>
											);
										} else if (equipment.type === EEquipmentType.TRACKER) {
											return (
												<React.Fragment key={equipment._id}>
													{index === 0 && tableHeaderTracker()}
													{tableRowTracker(equipment as IEquipmentTracker)}
												</React.Fragment>
											);
											// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
										} else if (equipment.type === EEquipmentType.CONTROLLER) {
											return (
												<React.Fragment key={equipment._id}>
													{index === 0 && tableHeaderController()}
													{tableRowController(equipment as IEquipmentController)}
												</React.Fragment>
											);
										} else if (equipment.type === EEquipmentType.OPERATOR) {
											return (
												<React.Fragment key={equipment._id}>
													{index === 0 && tableHeaderOperator()}
													{tableRowOperator(equipment as IEquipmentOperator)}
												</React.Fragment>
											);
										}
									})}
								</View>
							);
						}
					})}
				</View>
				{footer()}
			</Page>
			<Page size={'A4'} style={styles.body}>
				{pageTitle('OMRÅDE')}
				{lineSplitter()}
				{mapImage && <Image style={styles.imageArea} src={mapImage} />}
				{footer()}
			</Page>
			<Page size={'A4'} style={styles.body} orientation={'landscape'}>
				{pageTitle('ZONER')}
				{lineSplitter()}
				<View>
					{operation.geoData?.features.map((zone, index) => {
						return (
							<React.Fragment key={zone.id}>
								{index === 0 && tableHeaderZone()}
								{tableRowZone(zone)}
							</React.Fragment>
						);
					})}
				</View>
				{footer()}
			</Page>
			<Page size={'A4'} style={styles.body}>
				{pageTitle('REGLER')}
				{lineSplitter()}
				<View>
					{rules?.map((rule, index) => {
						return (
							<React.Fragment key={`rule_${index}`}>
								{index === 0 && tableHeaderRule()}
								{tableRowRule(rule)}
							</React.Fragment>
						);
					})}
				</View>
				{footer()}
			</Page>
		</Document>
	);
};
