import { Locale } from 'antd/lib/locale-provider';
import { atom, selector } from 'recoil';
import { CookieHandler, ECookies } from '../../Utils/CookieHandler';
const { setCookie, getCookies, getCookie, getAcceptedCookies, setAcceptedCookies } = CookieHandler();
import daDK from 'antd/lib/locale/da_DK';
import enGB from 'antd/lib/locale/en_GB';

// Set language on site
export const LANGUAGE_SL = selector<string>({
	key: 'languageSelector',
	get: async (): Promise<string> => {
		const cookies = getAcceptedCookies();
		const cookieLanguageSettings: string = getCookie(ECookies.LANGUAGE_SETTINGS);
		if (cookies.functionality && cookieLanguageSettings !== undefined) {
			return cookieLanguageSettings;
		} else {
			return 'da-DK';
		}
	},
	set: ({ set }, newValue) => {
		const cookies = getAcceptedCookies();
		if (cookies.functionality) {
			setCookie(ECookies.LANGUAGE_SETTINGS, newValue, 30);
		}
		set(LANGUAGE_AT, newValue);
	},
});

export const LANGUAGE_AT = atom({
	key: 'activeLanguage',
	default: LANGUAGE_SL,
});

export const CONFIGPROVIDER_SL = selector({
	key: 'configproviderSelector',
	get: ({ get }): Locale => {
		const state = get(LANGUAGE_AT);
		switch (state) {
			case 'en-US':
				return enGB;
			default:
				return daDK;
		}
	},
});
