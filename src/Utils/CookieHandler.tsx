import Cookies from 'js-cookie';

export enum ECookies {
	TERMS = '_terms',
	COOKIE_SETTINGS = '_cookieSettings',
	MAP_SETTINGS_LAYERS = '_mapSettingsLayers',
	MAP_SETTINGS_LAYERGROUP = '_mapSettingsLayerGroup',
	MAP_SETTINGS_BACKGROUND = '_mapSettingsBackground',
	LANGUAGE_SETTINGS = '_languageSettings',
	TERRAIN_SETTINGS = '_terrainSettings',
}

export type TAcceptedCookies = {
	necessary: boolean;
	functionality: boolean;
	statistics: boolean;
	marketing: boolean;
};

export const CookieHandler = () => {
	const setCookie = (name: ECookies, value: string | Object, expires?: number): void => {
		Cookies.set(name, value, { expires: expires });
	};

	const getCookie = (name: ECookies) => {
		return Cookies.getJSON(name);
	};

	const getCookies = () => {
		return Cookies.getJSON();
	};

	const removeCookie = (name: ECookies): void => {
		Cookies.remove(name);
	};

	const getAcceptedCookies = () => {
		let acceptedCookies: TAcceptedCookies = getCookie(ECookies.COOKIE_SETTINGS);
		if (!acceptedCookies) {
			acceptedCookies = {
				necessary: false,
				marketing: false,
				statistics: false,
				functionality: false,
			};
		}
		return acceptedCookies;
	};

	const setAcceptedCookies = (cookies: TAcceptedCookies) => {
		if (!cookies.functionality || !cookies.statistics || !cookies.marketing) {
			//Only save cookies for session
			setCookie(ECookies.COOKIE_SETTINGS, cookies);
		} else {
			//save cookies for 30 days
			setCookie(ECookies.COOKIE_SETTINGS, cookies, 30);
		}
	};

	return {
		setCookie: setCookie,
		getCookie: getCookie,
		getCookies: getCookies,
		removeCookie: removeCookie,
		getAcceptedCookies: getAcceptedCookies,
		setAcceptedCookies: setAcceptedCookies,
	};
};
