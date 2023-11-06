import { IOperationGeoDataFeature } from '@naviair-utm/node-shared-interfaces';
import { MapboxGeoJSONFeature } from 'mapbox-gl';
import { TFunction } from 'react-i18next';
import { ERuleType, IRuleItemProps } from '../..';

export enum ERuleZonePropsTypeId {
	EMBASSY = 'embassy',
	CASTLE = 'castle',
	POLICE = 'police',
	PRISON = 'prison',
	COLUMN3 = 'column3',
	MILITARY = 'military',
	AERODROME2 = 'aerodrome2',
	AERODROME5 = 'aerodrome5',
	HEMS1 = 'hems1',
	HEMS2 = 'hems2',
	NATURE = 'nature',
	WATER_AERODROME3 = 'waterAerodrome3', //Warning
	HELIPAD1 = 'helipad1', //Warning
	PRIVATE_RUNWAY3 = 'privateRunway3', //Warning
	AIRPORT_COMMERCIAL2 = 'airportCommercial2',
	AIRPORT_COMMERCIAL5 = 'airportCommercial5',
	PARACHUTE3 = 'parachute3', //Warning
	AIRPORT_MILITARY2 = 'airportMilitary2',
	AIRPORT_MILITARY8 = 'airportMilitary8',
	GLIDER_AERODROME3 = 'gliderAerodrome3', //Warning
}

export interface IRuleZonePropsStatic extends MapboxGeoJSONFeature {
	properties: {
		id?: string;
		address?: string;
		title?: string;
		typeId?: ERuleZonePropsTypeId;
	};
}

export interface IRuleZonePropsNotam extends MapboxGeoJSONFeature {
	properties: {
		name?: string;
		description?: string;
		type?: string;
		notams?: string; //Is a JSON object but needs to be converted
	};
}

const notamLayerNames: string[] = ['notam-active', 'notam-awareness', 'notam-disabled', 'notam-inactive'];

/*
export interface IRuleItemProps {
	title: string;
	description: string;
	type: ERuleType;
}
*/

/**
 *
 * @param zones : Zones from mapbox
 * @param operationFeatures : Array of features in the operation
 * @param t : Translation
 * @returns : Array of IRuleItemProps with applicable rules
 */
export const ruleGenerator = (zones: MapboxGeoJSONFeature[], operationFeatures: IOperationGeoDataFeature[], t: TFunction<'translations'>): IRuleItemProps[] => {
	const ruleArr: IRuleItemProps[] = [];
	//For only adding it once
	let notamRule = false;

	//Static informations returnes whenever there are more than 0 'features' in the operation (any zone is drawn)
	if (operationFeatures.length > 0) {
		ruleArr.push({
			title: 'Advarsel',
			description: [
				'Husk altid reglerne for droneflyvning findes på DRONEREGLER.DK, denne løsning er kun et visuelt supplement hertil',
				'Dronezoner der lukket for droneflyvning kan etableres over hele landet med kort varsel, tjek altid droneluftrum inden og under flyvning',
			],
			type: ERuleType.ERROR,
		});
		ruleArr.push({
			title: 'Vær opmærksom på at følgende typer af forhindringer og zoner som minimum IKKE vises',
			description: [
				'Ukendte ting: E.g. mobilkraner, nye bygninger, master, uheldssteder m.m.',
				'Infrastruktur: E.g. veje, by- og jernbaner, luftledninger m.m.',
				'Faste, høje objekter: E.g. vindmøller, master, skorstene, bygninger m.m.',
				'Private restriktioner: Områder, hvor lodsejer har pålagt begrænsninger for anvendelsen af pågældende areal, f.eks. ved forbud mod at starte/lande med droner fra/på området',
			],
			type: ERuleType.ERROR,
		});
	}

	// Loop through all zones (if any) and push relevant warnings
	zones.map((zone) => {
		if (notamLayerNames.includes(zone.layer.id)) {
			const typedZone: IRuleZonePropsNotam = zone as IRuleZonePropsNotam;
			const props = typedZone.properties;
			//Generel warning
			if (props.type) {
				if (!notamRule && ['notam-active', 'notam-disabled', 'notam-inactive'].includes(typedZone.layer.id)) {
					notamRule = true;
					ruleArr.push({
						title: 'Flyvning i dronezoner',
						description: [
							'Flyvning i et område med en statisk dronezone',
							'Dronezoner kan blive lukket for droneflyvning med kort varsel',
							'Tjek altid droneluftrum inden og under flyvning',
						],
						type: ERuleType.ERROR,
					});
				}
			}
		} else {
			const typedZone: IRuleZonePropsStatic = zone as IRuleZonePropsStatic;
			const props = typedZone.properties;

			if (props.typeId) {
				if (
					[
						ERuleZonePropsTypeId.EMBASSY,
						ERuleZonePropsTypeId.CASTLE,
						ERuleZonePropsTypeId.POLICE,
						ERuleZonePropsTypeId.PRISON,
						ERuleZonePropsTypeId.COLUMN3,
					].includes(props.typeId)
				) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning kun tilladt ved indhentning af tilladelse hos både infrastrukturforvalter og Trafikstyrelsen',
							'Tilladelse kræver kompetancecertifikat A2',
							'Se BEK 2253, §7: Afstandskrav til sikringskritiske områder',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.NATURE].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning kun tilladt ved indhentning af tilladelse hos Trafikstyrelsen',
							'Dog kan følgende opgaver udføres for forvalter af området, uden tilladelse: udførelse af nødvendige opgaver i forbindelse med tilsyn, vedligeholdelse, offentlige overvågningsaktiviteter og kontrolopgaver af anlæg, ejendomme, skovbrug, landbrug og dyrehold for forvalter af området',
							'Se BEK 2253, §9: Afstandskrav til støjfølsomme naturområder',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.MILITARY].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning kun tilladt ved indhentning af samtykke hos Forsvarskommandoen',
							'Se BEK 2253, §8: Afstandskrav til militære områder og fartøjer',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.AERODROME2, ERuleZonePropsTypeId.AIRPORT_COMMERCIAL2, ERuleZonePropsTypeId.AIRPORT_MILITARY2].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning kun tilladt ved indhentning af tilladelse hos Trafikstyrelsen',
							'Tilladelse kræver som minimum kompetancecertifikat A2',
							'Se BEK 2253, §6: Afstandskrav til flyversikringskritiske områder',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.AERODROME5, ERuleZonePropsTypeId.AIRPORT_COMMERCIAL5, ERuleZonePropsTypeId.AIRPORT_MILITARY8].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning tilladt op til 40m over landingsbanens højde i 2-5/8km zonen med kompetancecertifikat A2',
							'Flyvning over 40m kun tilladt ved indhentning af tilladelse hos Trafikstyrelsen',
							'Tilladelse til flyvning over 40m kræver som minimum kompetancecertifikat A2',
							'Se BEK 2253, §6: Afstandskrav til flyversikringskritiske områder',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.HEMS1].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning kun tilladt ved indhentning af tilladelse hos Trafikstyrelsen',
							'Tilladelse kræver som minimum kompetancecertifikat A2',
							'Se BEK 2253, §6: Afstandskrav til flyversikringskritiske områder',
						],
						type: ERuleType.ERROR,
					});
				} else if ([ERuleZonePropsTypeId.HEMS2].includes(props.typeId)) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Flyvning tilladt op til 50m over landingsbanens højde i 1-2km zonen, med kompetancecertifikat A2',
							'Flyvning over 50m er kun tilladt ved indhentning af tilladelse hos Trafikstyrelsen',
							'Tilladelse til flyvning over 50m kræver som minimum kompetancecertifikat A2',
							'Se BEK 2253, §6: Afstandskrav til flyversikringskritiske områder',
						],
						type: ERuleType.ERROR,
					});
				} else if (
					[
						ERuleZonePropsTypeId.HELIPAD1,
						ERuleZonePropsTypeId.WATER_AERODROME3,
						ERuleZonePropsTypeId.PRIVATE_RUNWAY3,
						ERuleZonePropsTypeId.PARACHUTE3,
						ERuleZonePropsTypeId.GLIDER_AERODROME3,
					].includes(props.typeId)
				) {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Ved flyvning i denne zone skal der udvises særlig opmærksomed over for øvrige luftrumsbrugere',
							'Droneoperationer skal altid vige for bemandet trafik',
							'Disse områder stammer fra den danske AIP',
						],
						type: ERuleType.WARNING,
					});
				} else {
					ruleArr.push({
						title: `${props.title} (${t(props.typeId)})`,
						description: [
							'Zonen er ukendt, se derfor BEK 2253 for mere information om regler for flyvning',
							'Fejlmeld denne zone på drone@naviair.dk med screenshot',
						],
						type: ERuleType.ERROR,
					});
				}
			}
		}
	});

	return ruleArr;
};
