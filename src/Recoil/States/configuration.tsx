import { IConfiguration } from '@naviair-utm/node-shared-interfaces';
import { selector } from 'recoil';
import { getConfiguration } from '../../Api/backendServices';

/**Get configuration, to decide how we render app */
export const CONFIGURATION_SL = selector({
	key: 'configuration',
	get: async ({ get }) => {
		const response: IConfiguration = await getConfiguration(get(DOMAIN_SL).replace(/\./g, '_')); // Regex replace . with _ to avoid errors with dots in URL
		return response;
	},
});

/**Get domain */
const DOMAIN_SL = selector({
	key: 'domain',
	get: async () => {
		const hostname = window.location.hostname;
		switch (hostname) {
			case '':
			case undefined:
				return 'localhost';
			default:
				return hostname;
		}
	},
});
