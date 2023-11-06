import { Antd } from '../Components/Common';

Antd.notification.config({
	duration: 3,
	placement: 'topRight',
	top: 70,
});

export enum ENotificationType {
	SUCCESS = 'success',
	ERROR = 'error',
	INFO = 'info',
	WARNING = 'warning',
	PLAIN = 'open',
}

const notification = (type: ENotificationType, description: string, message?: string) => {
	Antd.notification[type]({ message: message ? message : String(type).toUpperCase(), description: description });
};

export default notification;
