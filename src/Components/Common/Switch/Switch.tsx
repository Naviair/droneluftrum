import { SwitchProps } from 'antd';
import React from 'react';
import { Antd } from '../Antd';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISwitchProps extends SwitchProps {
	/** Custom target ID property for use in Event Handlers */
	id?: string;
}

/**
 * ## Switch
 * Creates an antd switch using default values. Override where necessary.
 *
 * For props see local ISwitchProps which extends Antd's SwitchProps
 *
 * @see ISwitchProps
 * @see SwitchProps
 *
 * @param props default values = [size, className]
 * @returns
 */
export const Switch: React.FC<ISwitchProps> = (props, { size = 'small', className = 'switch' }) => {
	return <Antd.Switch size={size} className={className} {...props} />;
};
