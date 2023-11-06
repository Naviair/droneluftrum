import { atom, selector, useSetRecoilState } from 'recoil';
import { getNotams } from '../../Api/backendServices';
import { INotamReturnZones } from '@naviair-utm/node-shared-interfaces';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NOTAM_SL = selector<INotamReturnZones>({
	key: 'notamSelector',
	get: async () => {
		reloadNotams();
		const response: INotamReturnZones = await getNotams().catch(() => Object.assign({}));
		return response;
	},
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NOTAM_AT = atom<INotamReturnZones>({
	key: 'notamAtom',
	default: NOTAM_SL,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NOTAM_LU_AT = atom<Date>({
	key: 'notamLastUpdatedAtom',
	default: new Date(),
});

const reloadNotams = () => {
	const setNotamRState = useSetRecoilState(NOTAM_AT);
	const setNotamLastUpdatedRState = useSetRecoilState(NOTAM_LU_AT);
	setInterval(() => {
		getNotams().then((value) => {
			setNotamRState(value);
			setNotamLastUpdatedRState(new Date());
		});
	}, 60000 * 15);
};
