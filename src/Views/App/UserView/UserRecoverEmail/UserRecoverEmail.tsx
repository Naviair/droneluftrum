import React, { useEffect, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Modal } from '@naviair-utm/react-shared-components';
import firebase from 'firebase/app';
import './styles.scss';

interface IUserRecoverEmailProps {
	actionCode: string;
	continueUrl: string;
	lang: string;
}

interface IResultProps {
	status: 'success' | 'info' | 'error' | 'warning';
	title: string;
	subtitle: JSX.Element | string;
	href: string;
	timed?: boolean;
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
					{props.timed ? (
						<Antd.Countdown
							onFinish={() => {
								window.location.href = props.href;
							}}
							value={Date.now() + 6000}
							format={'mm:ss'}
						/>
					) : undefined}
				</>
			}
			extra={[
				props.children,
				<Antd.Button href={props.href} type={'primary'} key={'tilbage'}>
					{props.buttonText}
				</Antd.Button>,
			]}
		/>
	);
};

/**
 * Recover email for user.
 * Uses firebase to verify the actionCode(oobCode)
 * We also leave an option to reset password, if user did not request the action
 * We check if db.email is the same as fb.email in ProfileView.tsx, to make sure that firebase and DB is always in sync.
 **/
export const UserRecoverEmail: React.FC<IUserRecoverEmailProps> = (props) => {
	const [t] = useTranslation('translations');
	const [ready, setReady] = useState(true);
	const [email, setEmail] = useState<string>();
	const [processReset, setProcessReset] = useState(false);
	const [resetSent, setResetSent] = useState(false);

	const sendResetPassword = (t: TFunction<'translations'>, auth: firebase.auth.Auth, mail: string) => {
		setProcessReset(true);
		auth
			.sendPasswordResetEmail(mail)
			.then(() => {
				setResetSent(true);
				setProcessReset(false);
				Antd.message.success(t('Der er blevet sendt et reset-link til den indtastede mailadresse.'));
			})
			.catch(() => {
				setProcessReset(false);
				Antd.message.warning(t('Der skete en fejl. Prøv igen, eller kontakt support.'));
			});
	};

	const checkActionCode = (auth: firebase.auth.Auth) => {
		return new Promise((resolve, reject) => {
			let restoredEmail: string;
			auth
				.checkActionCode(props.actionCode ? props.actionCode : '') // Check if actionCode is valid. If not the link was already used, not valid or deprecated.
				.then((resp) => {
					if (resp['data']['email']) {
						restoredEmail = resp['data']['email'];
						setEmail(restoredEmail);
					}
					return auth.applyActionCode(props.actionCode);
				})
				.catch(() => {
					setReady(false);
					reject();
				});
		});
	};

	useEffect(() => {
		checkActionCode(firebase.auth()).then(() => {
			setReady(true);
		});
	}, []);

	return (
		<Modal closable={false} visible footer={null}>
			{ready ? (
				<Result
					status={'success'}
					title={t('Opdateret mailadresse')}
					subtitle={
						<>
							<br /> {t('Din login-mailadresse er blevet ændret tilbage til ')} <br /> <div className={'font-weight-1k'}>{email}</div>
							<br />
							{t(
								'Hvis du ikke har bedt om at ændre din login-mail, er det muligt, at nogen forsøger at få adgang til din konto, og du bør ændre din adgangskode med det samme.'
							)}
						</>
					}
					href={'https://www.droneluftrum.dk'}
					buttonText={t('Gå til Droneluftrum')}>
					<Antd.Button
						className={'result-button-width'}
						onClick={resetSent ? undefined : () => sendResetPassword(t, firebase.auth(), email ? email : '')}
						key={'reset'}>
						{
							processReset ? (
								<LoaderSpin /> // Sending email reset button
							) : resetSent ? (
								<CheckCircleOutlined /> // Email was sent
							) : (
								t('Reset password')
							) // Button is not clicked yet
						}
					</Antd.Button>
				</Result>
			) : (
				<Result
					timed
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
