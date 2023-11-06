import { TEquiment } from '@naviair-utm/node-shared-interfaces';
import { fetchApi } from '../fetchApi';

type TEquipmentApiHook = {
	getEquipment: () => Promise<TEquiment[]>;
	createEquipment: (equipment: TEquiment) => Promise<TEquiment[]>;
	editEquipment: (equipment: TEquiment) => Promise<TEquiment[]>;
	deleteEquipment: (id: string) => Promise<TEquiment[]>;
};

export const equipmentApiHook = (token?: string): TEquipmentApiHook => {
	const getEquipment = async (): Promise<TEquiment[]> => {
		const body = JSON.stringify({ token: token });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<TEquiment[]>('/eqops/equipment/get', 'POST', body)
					.then((result) => {
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				reject('Token not initialized');
			}
		});
	};

	const createEquipment = async (equipment: TEquiment): Promise<TEquiment[]> => {
		const body = JSON.stringify({ token: token, object: equipment });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<TEquiment[]>('/eqops/equipment/create', 'POST', body)
					.then((result) => {
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				reject('Token not initialized');
			}
		});
	};

	const editEquipment = async (equipment: TEquiment): Promise<TEquiment[]> => {
		const body = JSON.stringify({ token: token, object: equipment });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<TEquiment[]>('/eqops/equipment/edit', 'POST', body)
					.then((result) => {
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				reject('Token not initialized');
			}
		});
	};

	const deleteEquipment = async (id: string): Promise<TEquiment[]> => {
		const body = JSON.stringify({ token: token, id: id });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<TEquiment[]>('/eqops/equipment/delete', 'POST', body)
					.then((result) => {
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				reject('Token not initialized');
			}
		});
	};

	return {
		getEquipment,
		createEquipment,
		editEquipment,
		deleteEquipment,
	};
};
