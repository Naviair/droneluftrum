import { IControl } from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Antd } from '../../..';
import { EIconTypes, IconName, Icon } from '@naviair-utm/react-shared-components';
import './styles.scss';

interface IMapboxButton {
	id: string;
	icon?: IconName | undefined;
	rawIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | undefined;
	activeIcon?: IconName | undefined;
	iconType?: IconsTypes;
	setActive?: boolean | undefined;
	rotate?: boolean | undefined;
	map: mapboxgl.Map;
	className?: string | undefined;
	onClick?: (activeState?: boolean) => void;
	buttonGroup?: string | undefined;
	tooltip: string;
}

const MapboxButton: React.FC<IMapboxButton> = (props) => {
	const [activeState, setActiveState] = useState(false);
	const [rotateState, setRotateState] = useState(0);

	useEffect(() => {
		props.map.on('rotate', () => onRotate());
		props.map.on('buttonGroupChange', (evt) => {
			if (props.buttonGroup === evt.group && props.id !== evt.key) {
				setActiveState(false);
			}
		});
	}, []);

	const onClick = () => {
		if (props.rotate) {
			props.map.easeTo({ bearing: 0 });
			setRotateState(0);
		}
		props.setActive && setActiveState(!activeState);
		props.onClick && props.onClick(!activeState);
		props.buttonGroup && props.map.fire('buttonGroupChange', { group: props.buttonGroup, key: props.id });
	};

	const onRotate = () => {
		if (props.rotate) {
			const angle = props.map.getBearing() * -1;
			setRotateState(angle);
		}
	};
	let iconButton;
	if (activeState && props.activeIcon) {
		iconButton = <Icon name={props.activeIcon} type={EIconTypes.LIGHT} />;
	} else if (props.icon) {
		iconButton = <Icon name={props.icon} type={EIconTypes.LIGHT} />;
	} else if (props.rawIcon) {
		iconButton = <props.rawIcon />;
	}

	return (
		<React.Suspense fallback={<div />}>
			<div style={{ transform: `rotate(${rotateState}deg)` }} className={'mapboxgl-ctrl mapboxgl-ctrl-group'}>
				<Antd.Tooltip title={props.tooltip}>
					<button key={`keyTrigger${activeState}`} className={`${activeState ? '-active' : ''} ${props.className ? props.className : ''}`} onClick={onClick}>
						{iconButton}
					</button>
				</Antd.Tooltip>
			</div>
		</React.Suspense>
	);
};

interface IMapboxControlOptions {
	id: string;
	icon?: IconName;
	rawIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	activeIcon?: IconName | undefined;
	onClick?: (isActive?: boolean) => void;
	setActive?: boolean;
	rotateIcon?: boolean;
	className?: string | undefined;
	buttonGroup?: string;
	tooltip: string;
}

export const MapboxControl = (options: IMapboxControlOptions): IControl => {
	let controlContainer: HTMLElement;
	let controlMap: mapboxgl.Map | undefined;

	const insertControls = (map: mapboxgl.Map) => {
		controlContainer = document.createElement('div');
		ReactDOM.render(
			<MapboxButton
				id={options.id}
				buttonGroup={options.buttonGroup}
				icon={options.icon}
				activeIcon={options.activeIcon}
				map={map}
				className={options.className}
				rotate={options.rotateIcon}
				rawIcon={options.rawIcon}
				setActive={options.setActive}
				onClick={options.onClick ? options.onClick : () => null}
				tooltip={options.tooltip}
			/>,
			controlContainer
		);
	};

	const onAdd = (map: mapboxgl.Map): HTMLElement => {
		controlMap = map;
		insertControls(map);
		return controlContainer;
	};

	const onRemove = (): void => {
		controlContainer.parentNode?.removeChild(controlContainer);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		controlMap = undefined;
	};

	return {
		onAdd: (map: mapboxgl.Map) => onAdd(map),
		onRemove: () => onRemove(),
	};
};
