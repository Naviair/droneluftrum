import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../../../../Components/Common';
import { Modal } from '@naviair-utm/react-shared-components';
import firebase from 'firebase/app';

interface IUserConfirmEmailProps {
	actionCode: string;
	continueUrl: string;
	lang: string;
}

interface IResultProps {
	status: 'success' | 'info' | 'error' | 'warning';
	title: string;
	subtitle: JSX.Element | string;
	href: string;
	buttonText: string;
}

const Result: React.FC<IResultProps> = (props) => {
	const [t] = useTranslation('translations');
	return (
		<Antd.Result
			status={props.status}
			title={t(props.title)}
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
					{t(props.buttonText)}
				</Antd.Button>,
			]}
		/>
	);
};

/**
 * Confirm email for user
 * Uses firbase to verify actionCode(oobCode). If not valid, redirect to 404, or show action not valid.
 **/

export const UserConfirmEmail: React.FC<IUserConfirmEmailProps> = (props) => {
	const [t] = useTranslation('translations');
	const [done, setDone] = useState(false);

	useEffect(() => {
		try {
			handleVerifyEmail(firebase.auth(), props.actionCode);
		} catch (e) {
			return e;
		}
	}, []);

	const handleVerifyEmail = (auth: firebase.auth.Auth, actionCode: string) => {
		return new Promise((resolve, reject) => {
			auth
				.applyActionCode(actionCode)
				.then((resp) => {
					setDone(true);
					resolve(resp);
				})
				.catch((err: string) => {
					reject(err);
				});
		});
	};

	return (
		<Modal closable={false} visible footer={null}>
			{done ? (
				<Result
					status={'success'}
					title={t('Din konto blev bekræftet')}
					subtitle={t('Du vil blive omdirigeret til Droneluftrum om:')}
					href={'https://www.droneluftrum.dk'}
					buttonText={t('Gå til Droneluftrum')}
				/>
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
