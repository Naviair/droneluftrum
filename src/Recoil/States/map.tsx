import { IConfiguration } from '@naviair-utm/node-shared-interfaces';
import { useRecoilValueLoadable, atom, DefaultValue, RecoilState, selector, useRecoilValue } from 'recoil';
import { CONFIGURATION_SL } from '.';
import { Recoil } from '..';
import { CookieHandler, ECookies } from '../../Utils/CookieHandler';
const { setCookie, getCookie, getAcceptedCookies } = CookieHandler();

/**
 * Set the style of the map.
 * @method get         |       Will look-up current cookie-information, and check if user has any preferences towards the map-background. Then set background, based on acquired information.
 * @method set         |       Sets the newly selected map-background, and updates the cookie, and @atom mapBackgroundAtom.
 */
export const MAP_BACKGROUND_SL = selector<number>({
	key: 'mapBackgroundSelector',
	get: async (): Promise<number> => {
		const cookies = getAcceptedCookies();
		const cookieMapSettingsBackground: number = getCookie(ECookies.MAP_SETTINGS_BACKGROUND);
		if (cookies.functionality && cookieMapSettingsBackground !== undefined) {
			return cookieMapSettingsBackground;
		} else {
			return 0;
		}
	},
	set: ({ set }, newValue) => {
		const cookies = getAcceptedCookies();
		if (cookies.functionality) {
			setCookie(ECookies.MAP_SETTINGS_BACKGROUND, newValue, 30);
		}
		set(MAP_BACKGROUND_AT, newValue);
	},
});

/**
 * Atom with information about the currently favored background.
 */
export const MAP_BACKGROUND_AT = atom({
	key: 'mapBackgroundAtom',
	default: MAP_BACKGROUND_SL,
});

/**
 * Set the style of the map in the form of a layer group. Works with tilesetGroups in configuration to display certain layers only (or all).
 * @method get         |       Look-up currently selected layer-settings in cookies, and render the layers.
 * @method set         |       Layer detailed filtering and update cookies and @atom mapLayerAtom.
 */
export const MAP_LAYERGROUP_SL = selector<number>({
	key: 'mapLayerGroupSelector',
	get: async (): Promise<number> => {
		const cookies = getAcceptedCookies();
		const cookieMapSettingsLayerGroup: number = getCookie(ECookies.MAP_SETTINGS_LAYERGROUP);
		if (cookies.functionality && cookieMapSettingsLayerGroup !== undefined) {
			return cookieMapSettingsLayerGroup;
		} else {
			return 1;
		}
	},
	set: ({ set }, newValue) => {
		const cookies = getAcceptedCookies();
		if (cookies.functionality) {
			setCookie(ECookies.MAP_SETTINGS_LAYERGROUP, newValue, 30);
		}
		set(MAP_LAYERGROUP_AT, newValue);
	},
});

/**
 * Atom with information about layer group habits.
 */
export const MAP_LAYERGROUP_AT = atom({
	key: 'mapLayerGroupAtom',
	default: MAP_LAYERGROUP_SL,
});

/**Key is layerId */
export type TMapLayers = {
	/**layerId */
	[key: string]: {
		/** If the layer switch should be toggled or not */
		toggled: boolean;
	};
};

/**
 * Handles map layers and whether they are toggled or not.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MAP_LAYERS_SL = selector<TMapLayers>({
	key: 'mapLayersSelector',
	get: ({ get }) => {
		//todo fix cookies
		// const cookies = getAcceptedCookies();
		// const cookieMapSettingsLayers: TMapLayers = getCookie(ECookies.MAP_SETTINGS_LAYERS);
		// if (cookies.functionality && cookieMapSettingsLayers !== undefined) {
		// 	return cookieMapSettingsLayers;
		// } else {
		const defaultLayers = get(MAP_LAYERS_AT);
		return defaultLayers;
		// }
	},
	set: ({ get, set }, newValue) => {
		const previousState = get(MAP_LAYERS_AT);
		//todo fix cookies
		// const cookies = getAcceptedCookies();
		// if (cookies.functionality) {
		// 	setCookie(ECookies.MAP_SETTINGS_LAYERS, { ...previousState, ...newValue }, 30);
		// }
		set(MAP_LAYERS_AT, { ...previousState, ...newValue }); //merge old state obj with new inner-obj
	},
});

/** Atom of MAP_LAYERS_SL that handles layers and their visibility on the map */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MAP_LAYERS_AT = atom({
	key: 'mapLayersAtom',
	default: selector({
		key: 'mapLayersAtomDefault',
		get: async () => {
			//todo fix cookies
			// const cookies = getAcceptedCookies();
			// const cookieMapSettingsLayers: TMapLayers = getCookie(ECookies.MAP_SETTINGS_LAYERS);
			// if (cookies.functionality && cookieMapSettingsLayers !== undefined) {
			// 	return cookieMapSettingsLayers;
			// }

			const configuration = useRecoilValue(Recoil.Configuration.Selector) as IConfiguration;
			return Object.keys(configuration.settings.map.tilesets).reduce((acc, id) => ({ ...acc, [id]: { toggled: true } } as TMapLayers), {});
		},
	}),
});

/**
 * (!) CURRENTLY NOT USED FOR ANYTHING.
 */
export const MAP_LOCATION_INFO_AT = atom({
	key: 'mapLocationInfoState',
	default: {
		show: false,
	},
});

/**
 * Used to save selected (latitude, longitude) coordinates based on search menu click.
 */
export const MAP_SEARCH_CLICK_AT: RecoilState<{ lat?: number; long?: number }> = atom({
	key: 'mapSearchClick',
	default: {},
});

export const MAP_TERRAIN_SL = selector<boolean>({
	key: 'mapTerrainSelector',
	get: ({ get }): boolean => {
		return get(MAP_TERRAIN_AT);
	},
	set: ({ set }, newValue) => {
		const cookies = getAcceptedCookies();
		if (cookies.functionality) {
			setCookie(ECookies.TERRAIN_SETTINGS, newValue, 30);
		}
		set(MAP_TERRAIN_AT, newValue);
	},
});

export const MAP_TERRAIN_AT = atom({
	key: 'mapTerrainAtom',
	default: false,
});
