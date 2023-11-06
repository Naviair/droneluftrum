import React, { createRef, useEffect, useState } from 'react';
import { EIconTypes, Icon, Skeleton, Drawer, IDrawerRef } from '@naviair-utm/react-shared-components';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { ChangeEmailView } from '../ChangeEmailView';
import { getIdToken } from '../../../../Firebase';
import firebase from 'firebase/app';
import { getUserInfo, IUserConfig } from '../../../../Api/backendServices';
import { fetchApi } from '../../../../Api/fetchApi';
import { Recoil, useRecoilValue } from '../../../../Recoil';
import { useTranslation } from 'react-i18next';
import '../styles.scss';

interface IProfileInputProps {
	inputDisabled?: boolean;
	title: string;
	placeholder: string;
	inputName: string;
}

const ProfileInput: React.FC<IProfileInputProps> = (props) => {
	const [t] = useTranslation('translations');
	return (
		<Antd.Row>
			<Antd.Col span={8}>
				<Antd.Typography.Text className={'drawer-input-title'}>
					{t(props.title)}
					{':'}
				</Antd.Typography.Text>
			</Antd.Col>
			<Antd.Col span={16}>
				<Antd.Form.Item className={'drawer-form-item'} name={props.inputName}>
					<Antd.Input disabled={props.inputDisabled} placeholder={t(props.placeholder)} />
				</Antd.Form.Item>
			</Antd.Col>
		</Antd.Row>
	);
};
interface IUserDrawer {
	visible: boolean;
	onClose: () => void;
}

export const ProfileView: React.FC<IUserDrawer> = (props) => {
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	const [processState, setProcessState] = useState(false);
	const [userInfo, setUserInfo] = useState<IUserConfig>();
	const [userLoaded, setUserLoaded] = useState(false);
	const [showResetEmail, setShowResetEmail] = useState(false);
	const drawerRef = createRef<IDrawerRef>();
	const [t] = useTranslation('translations');

	const resetEmail = () => {
		setShowResetEmail(true);
		props.onClose();
	};

	const confirmReset = () => {
		userInfo?.email
			? firebase
					.auth()
					.sendPasswordResetEmail(userInfo.email)
					.then(() => {
						Antd.message.info(t('Der er blevet sendt et reset-link til din email.'));
					})
					.catch(() => {
						Antd.message.error(t('Der skete en fejl: Prøv igen eller kontakt support.'));
					})
			: Antd.message.error(t('Der skete en fejl: Password kunne ikke resettes.'));
	};

	const footerButtons = (
		<>
			<div className={'drawer-right-section'}>
				<Antd.Button onClick={props.onClose} className={'cancel-btn'} type={'default'}>
					{t('Annullér')}
				</Antd.Button>
				{processState ? (
					<Antd.Button type={'default'}>
						<LoaderSpin />
					</Antd.Button>
				) : (
					<Antd.Button form={'user_profile'} htmlType={'submit'} type={'primary'}>
						{t('Gem')}
					</Antd.Button>
				)}
			</div>
		</>
	);

	const updateEmailDB = (values: IUserConfig) => {
		return new Promise((resolve, reject) => {
			getIdToken()
				.then((token) => {
					const body = { token: token, update: values };
					fetchApi<IUserConfig>('/user/update', 'POST', JSON.stringify(body))
						.then((result) => {
							resolve(result);
							props.onClose();
							Antd.message.success(t('Dine indstillinger blev gemt.'));
							setProcessState(false);
						})
						.catch((err) => {
							Antd.message.error(t('Der gik noget galt. Prøv venligst igen eller kontakt support.'));
							reject(err);
							setProcessState(false);
						});
				})
				.catch((err) => {
					reject(err);
					setProcessState(false);
				});
		});
	};

	const onFinish = (values: IUserConfig) => {
		setProcessState(true);
		updateEmailDB(values);
	};

	useEffect(() => {
		props.visible ? drawerRef.current?.open() : drawerRef.current?.close();
		getIdToken().then((token) => {
			setUserLoaded(false);
			getUserInfo(token).then((config) => {
				setUserInfo(config);
				// Database and Firebase email is not synced.
				if (config.email !== firebase.auth().currentUser?.email) {
					const updateEmail = { name: config.name, email: firebase.auth().currentUser?.email, phone: config.phone };
					const body = { token: token, update: updateEmail };
					fetchApi<IUserConfig>('/user/update', 'POST', JSON.stringify(body)).catch((err) => {
						return err;
					});
				}
				setUserLoaded(true);
			});
		});
	}, [props.visible]);

	return (
		<Drawer
			ref={drawerRef}
			disableCancelConfirm
			className={screenTypeS === EScreenType.MOBILE ? 'drawer-wrapper-mobile' : 'drawer-wrapper'}
			footer={footerButtons}
			mask={true}
			placement={screenTypeS === EScreenType.MOBILE ? 'bottom' : 'right'}
			closable={false}
			width={578}
			height={screenTypeS === EScreenType.MOBILE ? 568 : undefined}
			onClose={props.onClose}>
			<h4 className={'drawer-title'}>
				<Icon name={'user'} type={EIconTypes.REGULAR} /> {t('Min profil')}
			</h4>
			<Antd.Divider></Antd.Divider>
			{userLoaded ? (
				<Antd.Form
					name={'user_profile'}
					className={'drawer-form'}
					initialValues={{ name: userInfo?.name, email: firebase.auth().currentUser?.email, phone: userInfo?.phone }}
					onFinish={onFinish}>
					<ProfileInput title={'Navn'} placeholder={'Navn'} inputName={'name'} />
					<ProfileInput inputDisabled title={'Email'} placeholder={'Email'} inputName={'email'} />
					<ProfileInput title={'Mobil'} placeholder={'Mobil'} inputName={'phone'} />
					<div className={'drawer-right-section'}>
						<a onClick={() => resetEmail()}>{t('Skift email')}</a> <br />
						<Antd.Popconfirm
							placement={'bottomRight'}
							title={t('Vil du resette dit password?')}
							onConfirm={confirmReset}
							okText={t('Ja ')}
							cancelText={t('Nej')}>
							<a>{'Reset password'}</a>
						</Antd.Popconfirm>
					</div>
					<Antd.Divider />
				</Antd.Form>
			) : (
				<div className={'drawer-skeleton-div'}>
					<Skeleton
						backgroundColor={'#f9f9f9'}
						foregroundColor={'#96ae09'}
						speed={0.7}
						lines={[
							{ leftMarg: '10', topMarg: '15', width: '250', height: '7' },
							{ leftMarg: '10', topMarg: '30', width: '300', height: '7' },
							{ leftMarg: '10', topMarg: '45', width: '300', height: '7' },
						]}
					/>
				</div>
			)}

			<ChangeEmailView visible={showResetEmail} onClose={() => setShowResetEmail(false)} />
		</Drawer>
	);
};
