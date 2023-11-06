/* eslint-disable @typescript-eslint/naming-convention */
import { atom, selector } from 'recoil';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';

export const SCREEN_TYPE_AT = atom({
	key: 'appScreenType',
	default: EScreenType.DESKTOP,
});

export const SCREEN_LANDSCAPE_AT = atom({
	key: 'appScreenLandscape',
	default: false,
});

export const SHOW_INFO_MOBILE_AT = atom({
	key: 'showInfoMobile',
	default: {
		active: false,
		height: 0,
	},
});

export const GENERAL_LOADING_AT = atom({
	key: 'generalLoading',
	default: true,
});

export const SHOW_COOKIE_AT = atom({
	key: 'showCookieState',
	default: false,
});

export const SHOW_DISCLAIMER_AT = atom({
	key: 'showDisclaimerState',
	default: false,
});

/**
 * Selector for returning dropdown trigger
 * If EScreenType.MOBILE, we should use click trigger for better responsiveness.
 * EScreenType.MOBILE also includes tablets.
 * Else, hover.
 * @returns See {@link TDropDownTrigger} or undefined.
 */

type TDropDownTrigger = ('click' | 'hover' | 'contextMenu')[];

export const DROPDOWN_TRIGGER_SL = selector({
	key: 'dropdownTriggerSelector',
	get: ({ get }): TDropDownTrigger => {
		const state = get(SCREEN_TYPE_AT);
		switch (state) {
			case EScreenType.MOBILE:
				return ['click'];
			default:
				return ['hover'];
		}
	},
});
/* eslint-enable @typescript-eslint/naming-convention */
