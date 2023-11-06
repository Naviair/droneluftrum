import { EAltitudeType, EAltitudeUnits, INotamLimitsDetails } from '@naviair-utm/node-shared-interfaces';
import moment from 'moment-timezone';

export const formatLimits = (limit: INotamLimitsDetails | undefined): string => {
	if (limit) {
		const altitude = limit.altitude ? limit.altitude : 0;
		const limitType = limit.type ? `(${limit.type})` : '';
		if (limit.type === EAltitudeType.SFC || limit.type === EAltitudeType.GND) {
			return `0m ${limitType}`;
		} else if (limit.type === EAltitudeType.UNL) {
			return `999999m ${limitType}`;
		} else if (limit.units === EAltitudeUnits.FL) {
			return `${String(Number(altitude * 100 * 0.3048).toFixed(0))}m ${limitType}`;
		} else if (limit.units === EAltitudeUnits.FT) {
			return `${String(Number(altitude * 0.3048).toFixed(0))}m ${limitType}`;
		} else if (limit.units === EAltitudeUnits.M) {
			return `${limit.units}m ${limitType}`;
		} else {
			return 'Unknown';
		}
	} else {
		return '';
	}
};

export const formatDateTime = (datetime: moment.Moment): string => {
	return `${datetime.format('DD-MM-YYYY HH:mm zz')}`;
};

export const getColor = (momentStart: moment.Moment, momentEnd: moment.Moment, code?: string): string => {
	const curMomentUnix = moment().unix();
	const curMomentStartUnix = momentStart.unix();

	if (code && ['RRCA', 'RTCA', 'RDCA', 'RPCA'].includes(code)) {
		if (curMomentStartUnix > curMomentUnix) {
			return '255,204,0'; //Inactive
		} else {
			return '211,94,96'; //Active
		}
	} else {
		return '255,151,76'; //Awareness
	}
};
