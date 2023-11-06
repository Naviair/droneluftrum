import React from 'react';
import { IGeo, ILatLng } from '@naviair-utm/node-shared-interfaces';

import './styles.scss';

/**
 * Props ARGS:
 * (Is only used with geoData atm - might wanna chance these as we find more infobox usages)
 * ----------
 * onClose       :      Set onclose event
 * latLng        :      latitude longitude values
 * geoInfo       :      Information about geo location
 * headerContent :      Content of the header
 */

export interface IInfoBoxHeaderProps {
	onClose: () => void;
	latLng?: ILatLng;
	geoInfo?: IGeo;
	headerContent: JSX.Element;
}

export const InfoboxHeader: React.FC<IInfoBoxHeaderProps> = (props) => {
	return <>{props.headerContent}</>;
};
