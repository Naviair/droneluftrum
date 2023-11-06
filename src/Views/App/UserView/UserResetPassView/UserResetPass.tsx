import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { EIconTypes, IconName, Modal, Icon } from '@naviair-utm/react-shared-components';
import firebase from 'firebase/app';
import './styles.scss';

interface IUserResetPassProps {
	actionCode: string;
	continueUrl: string;
	lang: string;
}

interface IResetInputProps {
	inputDisabled?: boolean;
	placeholder: string;
	inputName: string;
	inputType?: string;
	rules?: {
		required?: boolean;
		message?: string;
	};
	icon: IconName;
}

const ResetInput: React.FC<IResetInputProps> = (props) => {
	const [t] = useTranslation('translations');

	return (
		<Antd.Form.Item name={props.inputName} rules={[{ required: props.rules?.required, message: t(String(props.rules?.message)) }]}>
			{props.inputType === 'password' ? (
				<Antd.Input.Password prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />} type={props.inputType} placeholder={t(props.placeholder)} />
			) : (
				<Antd.Input prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />} type={props.inputType} placeholder={t(props.placeholder)} />
			)}
		</Antd.Form.Item>
	);
};

interface IResultProps {
	status: 'success' | 'info' | 'error' | 'warning';
	title: string;
	subtitle: JSX.Element | string;
	href: string;
	buttonText: string;
}

const Result: React.FC<IResultProps> = (props) => {
	return (
		<Antd.Result
			status={props.status}
			title={props.title}
			subTitle={
				<>
					{props.subtitle}
					<Antd.Countdown
						onFinish={() => {
							window.location.href = props.href;
						}}
						value={Date.now() + 6000}
						format={'mm:ss'}
					/>
				</>
			}
			extra={[
				<Antd.Button href={props.href} type={'primary'} key={'tilbage'}>
					{props.buttonText}
				</Antd.Button>,
			]}
		/>
	);
};

/**
 * Reset password for user
 * User is prompted to type and retype new password
 * Uses firebase to verify actionCode. If not valid redirect to 404, or show action not valid.
 * Passwords are handled entirely by firebase, and not stored in DB.
 **/
export const UserResetPass: React.FC<IUserResetPassProps> = (props) => {
	const [processState, setProcessState] = useState(false);
	const [t] = useTranslation('translations');
	const [ready, setReady] = useState(true);
	const [done, setDone] = useState(false);

	const verifyActionCode = () => {
		return new Promise((resolve, reject) => {
			firebase
				.auth()
				.verifyPasswordResetCode(props.actionCode ? props.actionCode : '')
				.then((resp) => {
					resolve(resp);
				})
				.catch(() => {
					setReady(false);
					reject();
				});
		});
	};

	useEffect(() => {
		verifyActionCode().then(() => {
			setReady(true);
		});
	}, []);

	const onFinish = async (values: { password: string; password2: string }) => {
		setProcessState(true);
		if (values.password !== values.password2) {
			Antd.message.error(t('Passwords er ikke ens!'));
			setProcessState(false);
		} else {
			try {
				if (props) {
					handleResetPassword(values.password, firebase.auth(), props.actionCode)
						.then(() => {
							setDone(true);
							setProcessState(false);
						})
						.catch((err) => {
							setProcessState(false);
							if (err.code.includes('auth/weak-password')) {
								Antd.message.error(t('Kodeordet er for svagt. Det skal være mindst 6 bogstaver.'));
							} else {
								Antd.message.error(t('Password kunne ikke resettes.'));
							}
						});
				}
			} catch (e) {
				Antd.message.error(t('Password kunne ikke resettes.'));
				setProcessState(false);
			}
		}
	};

	const handleResetPassword = (newPassword: string, auth: firebase.auth.Auth, actionCode: string) => {
		return new Promise((resolve, reject) => {
			if (props) {
				auth
					.verifyPasswordResetCode(actionCode)
					.then((email: string) => {
						const accountEmail = email;
						auth
							.confirmPasswordReset(props.actionCode, newPassword)
							.then(() => {
								auth.signInWithEmailAndPassword(accountEmail, newPassword);
								resolve(email);
							})
							.catch((err: string) => {
								reject(err);
							});
					})
					.catch((err: string) => {
						reject(err);
					});
			}
		});
	};

	const footerButtons = (
		<>
			{processState ? (
				<Antd.Button className={'user-reset-pass-button'} type={'default'} htmlType={'submit'}>
					<LoaderSpin />
				</Antd.Button>
			) : (
				<Antd.Button form={'resetpass'} className={'user-reset-pass-button'} type={'primary'} htmlType={'submit'}>
					{t('Skift password')}
				</Antd.Button>
			)}
		</>
	);

	return done ? (
		<Modal closable={false} visible footer={null}>
			<Result
				status={'success'}
				title={t('Dit password blev ændret')}
				subtitle={t('Du vil blive omdirigeret til Droneluftrum om:')}
				href={'https://www.droneluftrum.dk'}
				buttonText={t('Gå til Droneluftrum')}
			/>
		</Modal>
	) : (
		<Modal closable={false} visible footer={ready ? [footerButtons] : null}>
			{ready ? (
				<div>
					<h4>{t('Nyt password')}</h4>
					<Antd.Divider></Antd.Divider>
					<Antd.Form name={'resetpass'} initialValues={{ remember: true }} onFinish={onFinish}>
						<ResetInput
							inputName={'password'}
							inputType={'password'}
							rules={{ required: true, message: 'Skriv dit nye password' }}
							icon={'key'}
							placeholder={'Skriv dit nye password'}
						/>
						<ResetInput
							inputName={'password2'}
							inputType={'password'}
							rules={{ required: true, message: 'Gentag dit nye password' }}
							icon={'lock'}
							placeholder={'Gentag dit nye password'}
						/>
					</Antd.Form>
				</div>
			) : (
				<Result
					status={'warning'}
					title={t('Funktion ikke tilgængelig')}
					subtitle={
						<>
							{t('Linket du har åbnet er ikke gyldigt.')} <br /> {t('Du vil blive omdirigeret til Droneluftrum om:')}
						</>
					}
					href={'https://www.droneluftrum.dk'}
					buttonText={t('Tilbage til Droneluftrum')}
				/>
			)}
		</Modal>
	);
};
