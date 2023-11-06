import React from 'react';
import { MapControlView } from '../../../Components';
import { SingleLayout } from '@naviair-utm/react-shared-components';

export const MapView: React.FC = () => {
	return (
		<SingleLayout fill>
			<MapControlView />
		</SingleLayout>
	);
};
