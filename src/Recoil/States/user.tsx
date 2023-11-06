/* eslint-disable @typescript-eslint/naming-convention */
import { atom } from 'recoil';

export const LOGIN_MODAL_AT = atom({
	key: 'loginModalState',
	default: false,
});

export const RESET_MODAL_AT = atom({
	key: 'resetModalState',
	default: false,
});

export const REGISTER_MODAL_AT = atom({
	key: 'createModalState',
	default: false,
});
