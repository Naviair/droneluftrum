import { IControl } from 'mapbox-gl';
import { MapboxControl } from '../';

export interface ICallbackControlOptions {
	onClick: (isActive?: boolean) => void;
	setActive?: boolean;
	icon?: string;
	activeIcon?: string;
	id: string;
	buttonGroup: string;
	color?: string;
	colorWeight?: number;
	className?: string;
	tooltip: string;
}

export const CallbackControl = (options: ICallbackControlOptions): IControl => {
	return MapboxControl({
		onClick: options.onClick,
		icon: options.icon ? options.icon : 'layer-group', //fallback
		activeIcon: options.activeIcon,
		setActive: true,
		id: options.id,
		buttonGroup: options.buttonGroup,
		className: options.className,
		tooltip: options.tooltip,
	});
};
