// TODO: This is removed when merged with 3790

import { ModalProps } from 'antd';
import { ILayer } from '../../../Components/MapControl/InfoBox/InfoBoxTypes';

export interface IModalProps extends ModalProps {
	visible: boolean;
	title?: React.ReactNode | string;
	draggable?: boolean;
	closable?: boolean;
	maskClosable?: boolean;
	footerButtons?: JSX.Element[] | null;
	onOk?: () => void;
	onClose?: () => void;
	width?: string;
	record?: ILayer;
	renderInDom?: boolean;
}
