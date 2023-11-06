import React from 'react';
import { Antd } from '../Antd';
import { LoadingOutlined } from '@ant-design/icons';

export const LoaderSpin: React.FC = () => {
	const spinIcon = <LoadingOutlined style={{ fontSize: 16}} spin/>;
	return (
		<div >
			<Antd.Spin indicator={spinIcon} size={'large'} />
		</div>
	);
};

export default LoaderSpin;