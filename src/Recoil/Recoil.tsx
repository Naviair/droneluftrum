// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */
// Import atoms/selectors
import {
	LANGUAGE_SL,
	LANGUAGE_AT,
	NOTAM_SL,
	NOTAM_AT,
	NOTAM_LU_AT,
	GENERAL_LOADING_AT,
	CONFIGURATION_SL,
	SCREEN_TYPE_AT,
	SCREEN_LANDSCAPE_AT,
	SHOW_INFO_MOBILE_AT,
	SHOW_COOKIE_AT,
	SHOW_DISCLAIMER_AT,
	MAP_BACKGROUND_SL,
	MAP_BACKGROUND_AT,
	MAP_LAYERGROUP_SL,
	MAP_LAYERGROUP_AT,
	MAP_LOCATION_INFO_AT,
	MAP_SEARCH_CLICK_AT,
	MAP_TERRAIN_SL,
	MAP_TERRAIN_AT,
	LOGIN_MODAL_AT,
	RESET_MODAL_AT,
	REGISTER_MODAL_AT,
	DROPDOWN_TRIGGER_SL,
	CONFIGPROVIDER_SL,
	MAP_LAYERS_SL,
	MAP_LAYERS_AT,
} from './States';

// Export functionality from recoil lib
export { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';

// Export atoms/selectors/handlers
export const Recoil = {
	// STATES
	Language: {
		Selector: LANGUAGE_SL,
		Atom: LANGUAGE_AT,
	},
	Notam: {
		Selector: NOTAM_SL,
		Atom: NOTAM_AT,
	},
	NotamLastUpdated: {
		Atom: NOTAM_LU_AT,
	},
	GeneralLoading: {
		Atom: GENERAL_LOADING_AT,
	},
	Configuration: {
		Selector: CONFIGURATION_SL,
	},
	ScreenType: {
		Atom: SCREEN_TYPE_AT,
	},
	ScreenLandscape: {
		Atom: SCREEN_LANDSCAPE_AT,
	},
	ShowInfoMobile: {
		Atom: SHOW_INFO_MOBILE_AT,
	},
	ShowCookie: {
		Atom: SHOW_COOKIE_AT,
	},
	ShowDisclaimer: {
		Atom: SHOW_DISCLAIMER_AT,
	},
	MapBackground: {
		Selector: MAP_BACKGROUND_SL,
		Atom: MAP_BACKGROUND_AT,
	},
	MapLayerGroup: {
		Selector: MAP_LAYERGROUP_SL,
		Atom: MAP_LAYERGROUP_AT,
	},
	mapLayers: {
		Selector: MAP_LAYERS_SL,
		Atom: MAP_LAYERS_AT,
	},

	MapLocationInfo: {
		Atom: MAP_LOCATION_INFO_AT,
	},
	MapSearchClick: {
		Atom: MAP_SEARCH_CLICK_AT,
	},
	MapTerrain: {
		Selector: MAP_TERRAIN_SL,
		Atom: MAP_TERRAIN_AT,
	},
	LoginModal: {
		Atom: LOGIN_MODAL_AT,
	},
	ResetModal: {
		Atom: RESET_MODAL_AT,
	},
	RegisterModal: {
		Atom: REGISTER_MODAL_AT,
	},
	DropDownTrigger: {
		Selector: DROPDOWN_TRIGGER_SL,
	},
	Locale: {
		Selector: CONFIGPROVIDER_SL,
	},
};
