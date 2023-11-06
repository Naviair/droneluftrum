import { fetchApi } from './fetchApi';
import { IConfiguration, IGeo, IWeatherWeek, IWeather, INotamReturnZones } from '@naviair-utm/node-shared-interfaces';
import { FeatureCollection } from 'geojson';
export interface IUserConfig {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_id?: string;
	uid?: string | undefined;
	email?: string;
	name?: string;
	age?: string;
	phone?: string;
}

export const getUserInfo = (token: string): Promise<IUserConfig> => {
	const body = JSON.stringify({ token: token });
	return new Promise((resolve, reject) => {
		fetchApi<IUserConfig>('/user/get', 'POST', body)
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getConfiguration = (domain: string): Promise<IConfiguration> => {
	return new Promise((resolve, reject) => {
		fetchApi<IConfiguration>(`/conf/${domain}`, 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getWeatherForecast = (lat: number, long: number, lang?: string): Promise<IWeatherWeek> => {
	return new Promise((resolve, reject) => {
		fetchApi<IWeatherWeek>(`/geo/weather/forecast?lat=${lat}&long=${long}&lang=${lang?.substring(0, 2) ?? 'da'}`, 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getWeatherCurrent = (lat: number, long: number, lang?: string): Promise<IWeather> => {
	return new Promise((resolve, reject) => {
		fetchApi<IWeather>(`/geo/weather/current?lat=${lat}&long=${long}&lang=${lang?.substring(0, 2) ?? 'da'}`, 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getGeoInfo = (lat: number, long: number, lang?: string): Promise<IGeo> => {
	return new Promise((resolve, reject) => {
		fetchApi<IGeo>(`/geo/info?lat=${lat}&long=${long}&lang=${lang?.substring(0, 2) ?? 'da'}`, 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getNotams = (): Promise<INotamReturnZones> => {
	return new Promise((resolve, reject) => {
		fetchApi<INotamReturnZones>('aftn/messages', 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getZones = (): Promise<FeatureCollection> => {
	return new Promise((resolve, reject) => {
		fetchApi<FeatureCollection>('zones/get', 'GET')
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			});
	});
};
