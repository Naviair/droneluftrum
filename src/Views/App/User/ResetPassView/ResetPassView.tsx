/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { FC, useState } from 'react';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { EIconTypes, IModalProps, Icon, Modal } from '@naviair-utm/react-shared-components';
import firebase from 'firebase/app';
import '../styles.scss';
import { useTranslation } from 'react-i18next';
import { faAt } from '@fortawesome/pro-light-svg-icons/faAt';

interface IResetProps {
	loginState?: () => void;
}

export const ResetPassView: FC<IModalProps & IResetProps> = (props) => {
	const [processState, setProcessState] = useState(false);
	const [t] = useTranslation('translations');

	const onFinish = async (values: { email: string }) => {
		setProcessState(true);
		firebase
			.auth()
			.sendPasswordResetEmail(values.email)
			.then(() => {
				Antd.message.info(t('Der er blevet sendt et reset-link til den indtastede mailadresse.'));
				props.onClose?.();
				setProcessState(false);
			})
			.catch(() => {
				setProcessState(false);
				Antd.message.error(t('Der skete en fejl. Prøv igen, eller kontakt support.'));
			});
	};

	const footerButtons = (
		<>
			{processState ? (
				<Antd.Button className={'modal-130-button'} type={'default'} htmlType={'submit'}>
					<LoaderSpin />
				</Antd.Button>
			) : (
				<Antd.Button form={'resetpass'} className={'modal-130-button'} type={'primary'} htmlType={'submit'}>
					{t('Gendan')}
				</Antd.Button>
			)}
			<br></br>
			{t('Eller ')}
			<a className={'modal-link'} onClick={props.loginState}>
				{t('log ind')}
			</a>
		</>
	);

	return (
		<Modal {...props} footer={[footerButtons]} closable>
			<div className={'modal-content'}>
				<h4>{t('Glemt password')}</h4>
				<Antd.Divider></Antd.Divider>
				<Antd.Form name={'resetpass'} initialValues={{ remember: true }} onFinish={onFinish}>
					<Antd.Form.Item name={'email'} rules={[{ required: true, message: t('Email er ikke gyldig.') }]}>
						<Antd.Input type={'email'} prefix={<Icon name={'at'} icon={faAt} type={EIconTypes.LIGHT} />} placeholder={t('Email')} />
					</Antd.Form.Item>
				</Antd.Form>
			</div>
		</Modal>
	);
};

/* eslint-enable @typescript-eslint/no-unnecessary-condition */
