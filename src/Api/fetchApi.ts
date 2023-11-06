// eslint-disable-next-line @typescript-eslint/naming-convention
export const fetchApiLocal = async <T>(serviceMethod: string, method: 'POST' | 'GET' | 'DELETE' = 'GET', body?: BodyInit): Promise<T> => {
	return new Promise((resolve, reject) => {
		if (serviceMethod) {
			const endpoint = serviceMethod;
			const settings: RequestInit = {
				method: method,
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Accept: 'application/json',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-type': 'application/json',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Ocp-Apim-Subscription-Key': process.env.REACT_APP_BACKEND_API_KEY ?? '',
				},
				body: body,
			};
			try {
				fetch(endpoint, settings).then((fetchRespone) => {
					fetchRespone.json().then((responseData) => resolve(responseData));
				});
			} catch (error) {
				reject(error);
			}
		} else {
			reject('Error, no endpoint defined');
		}
	});
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const fetchApi = async <T>(serviceMethod: string, method: 'POST' | 'GET' | 'DELETE' = 'GET', body?: BodyInit): Promise<T> => {
	return new Promise((resolve, reject) => {
		if (serviceMethod) {
			const endpoint = `${process.env.REACT_APP_BACKEND_API_URL}${serviceMethod}`;
			const settings: RequestInit = {
				method: method,
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Accept: 'application/json',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-type': 'application/json',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Ocp-Apim-Subscription-Key': process.env.REACT_APP_BACKEND_API_KEY ?? '',
				},
				body: body,
			};
			try {
				fetch(endpoint, settings).then((fetchResponse) => {
					/* If fetch not OK, service is down. Reject */
					if (!fetchResponse.ok) {
						reject(fetchResponse);
					}
					fetchResponse.json().then((responseData) => resolve(responseData));
				});
			} catch (error) {
				reject(error);
			}
		} else {
			reject('Error, no endpoint defined');
		}
	});
};
