/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { FC, useState } from 'react';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { EIconTypes, IconName, IModalProps, Modal, Icon } from '@naviair-utm/react-shared-components';
import { fbAuth, TLoginData, getIdToken } from '../../../../Firebase';
import { fetchApi } from '../../../../Api/fetchApi';
import { IUserConfig } from '../../../../Api/backendServices';
import { useTranslation } from 'react-i18next';
import firebase from 'firebase/app';
import '../styles.scss';
import { Rule } from 'antd/lib/form';

interface IChangeEmailInputProps {
	inputDisabled?: boolean;
	placeholder: string;
	inputName: string;
	inputType?: string;
	rules?: Rule[];
	icon: IconName;
}

const ChangeEmailInput: React.FC<IChangeEmailInputProps> = (props) => {
	return (
		<Antd.Form.Item name={props.inputName} rules={props.rules}>
			{props.inputType === 'password' ? (
				<Antd.Input.Password prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />} type={props.inputType} placeholder={props.placeholder} />
			) : (
				<Antd.Input prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />} type={props.inputType} placeholder={props.placeholder} />
			)}
		</Antd.Form.Item>
	);
};

interface IResetProps {
	loginState?: () => void;
}

export const ChangeEmailView: FC<IModalProps & IResetProps> = (props) => {
	const [processState, setProcessState] = useState(false);
	const [, getUserState, , logout] = fbAuth();
	const [t] = useTranslation('translations');

	const onFinish = async (values: TLoginData & { mail2: 'string' }) => {
		setProcessState(true);
		if (values.mail !== values.mail2) {
			Antd.message.error(t('De indtastede mails er ikke ens!')), setProcessState(false);
		} else {
			getUserState?.email
				? firebase
						.auth()
						.signInWithEmailAndPassword(getUserState.email, values.password)
						.then(async (userCredential) => {
							await userCredential.user?.updateEmail(values.mail);
							await userCredential.user?.sendEmailVerification();
							Antd.message.info(t('Der er blevet sendt et bekræftelseslink til den nye email - Log venligst ind igen men din nye mail.'));
							props.onClose?.();
							return new Promise((resolve, reject) => {
								getIdToken()
									.then((token) => {
										const body = { token: token, update: { email: values.mail } };
										fetchApi<IUserConfig>('/user/update', 'POST', JSON.stringify(body))
											.then((result) => {
												resolve(result);
												props.onClose?.();
												// Make sure we logout
												logout();
												setProcessState(false);
											})
											.catch((err) => {
												Antd.message.error(err);
												setProcessState(false);
											});
									})
									.catch((err) => {
										Antd.message.error(t('Kunne ikke validere bruger. Prøv igen senere.'));
										reject(err);
										setProcessState(false);
									});
							});
						})
						.catch((err) => {
							setProcessState(false);
							if (err.code.includes('auth/wrong-password')) {
								Antd.message.error(t('Passwordet er ikke korrekt'));
							} else if (err.code.includes('auth/too-many-requests')) {
								Antd.message.error(t('For mange requests - Brugeren er midlertidig deaktiveret. Prøv igen senere, eller kontakt support.'));
							} else {
								Antd.message.error(t('Der skete en fejl. Prøv igen, eller kontakt support.'));
							}
						})
				: (setProcessState(false), Antd.message.error('Der skete en fejl.'));
		}
	};

	const footerButtons = (
		<>
			{processState ? (
				<Antd.Button className={'modal-160-button'} type={'default'} htmlType={'submit'}>
					<LoaderSpin />
				</Antd.Button>
			) : (
				<Antd.Button className={'modal-160-button'} form={'resetemail'} type={'primary'} htmlType={'submit'}>
					{t('Send bekræftelse')}
				</Antd.Button>
			)}
		</>
	);

	return (
		<Modal {...props} footer={[footerButtons]} closable>
			<div className={'modal-content'}>
				<h4>{t('Skift email')}</h4>
				<Antd.Divider></Antd.Divider>
				<Antd.Form name={'resetemail'} initialValues={{ remember: true }} onFinish={onFinish}>
					<ChangeEmailInput inputName={'mail'} rules={[{ required: true, message: t('Email er ikke gyldig.') }]} icon={'at'} placeholder={'Ny email'} />
					<ChangeEmailInput inputName={'mail2'} rules={[{ required: true, message: t('Email er ikke gyldig.') }]} icon={'at'} placeholder={'Gentag ny email'} />
					<ChangeEmailInput
						inputName={'password'}
						inputType={'password'}
						rules={[{ required: true, message: t('Password er ikke gyldigt.') }]}
						icon={'key'}
						placeholder={'Password'}
					/>
				</Antd.Form>
			</div>
		</Modal>
	);
};

/* eslint-enable @typescript-eslint/no-unnecessary-condition */
