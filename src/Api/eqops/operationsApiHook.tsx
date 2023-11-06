import { IOperation } from '@naviair-utm/node-shared-interfaces';
import { fetchApi } from '../fetchApi';

type TOperationsApiHook = {
	getOperations: () => Promise<IOperation[]>;
	createOperation: (equipment: IOperation) => Promise<IOperation[]>;
	editOperation: (equipment: IOperation) => Promise<IOperation[]>;
	deleteOperation: (id: string) => Promise<IOperation[]>;
};

export const operationsApiHook = (token?: string): TOperationsApiHook => {
	const getOperations = async (): Promise<IOperation[]> => {
		const body = JSON.stringify({ token: token });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<IOperation[]>('/eqops/operations/get', 'POST', body)
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

	const createOperation = async (equipment: IOperation): Promise<IOperation[]> => {
		const body = JSON.stringify({ token: token, object: equipment });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<IOperation[]>('/eqops/operations/create', 'POST', body)
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

	const editOperation = async (equipment: IOperation): Promise<IOperation[]> => {
		const body = JSON.stringify({ token: token, object: equipment });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<IOperation[]>('/eqops/operations/edit', 'POST', body)
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

	const deleteOperation = async (id: string): Promise<IOperation[]> => {
		const body = JSON.stringify({ token: token, id: id });
		return new Promise((resolve, reject) => {
			if (token) {
				fetchApi<IOperation[]>('/eqops/operations/delete', 'POST', body)
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
		getOperations,
		createOperation,
		editOperation,
		deleteOperation,
	};
};
