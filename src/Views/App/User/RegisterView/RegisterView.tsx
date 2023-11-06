/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { FC, useState } from 'react';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { EIconTypes, IconName, IModalProps, Icon, Modal } from '@naviair-utm/react-shared-components';
import { createUser } from '../../../../Firebase';
import { useTranslation } from 'react-i18next';
const { Option } = Antd.Select;
import '../styles.scss'; //! points two layers out!
import { IDocument } from '@naviair-utm/node-shared-interfaces';
import { Document } from '../../../../Components';
import { LanguageDropdown } from '../../../../Components/LanguageDropdown';
import { Rule } from 'antd/lib/form';
import { faPhone } from '@fortawesome/pro-light-svg-icons/faPhone';

interface IRegisterInputProps {
	inputDisabled?: boolean;
	placeholder: string;
	inputName: string;
	inputType?: string;
	autoFocus?: boolean;
	rules?: Rule[];
	icon: IconName;
}

const RegisterInput: React.FC<IRegisterInputProps> = (props) => {
	return (
		<Antd.Form.Item name={props.inputName} rules={props.rules}>
			{props.inputType === 'password' ? (
				<Antd.Input.Password
					autoFocus={props.autoFocus}
					prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />}
					type={props.inputType}
					placeholder={props.placeholder}
				/>
			) : (
				<Antd.Input
					autoFocus={props.autoFocus}
					prefix={<Icon name={props.icon} type={EIconTypes.REGULAR} />}
					type={props.inputType}
					placeholder={props.placeholder}
				/>
			)}
		</Antd.Form.Item>
	);
};
interface IRegisterProps {
	loginState?: () => void;
	docTerms: IDocument;
}

type TRegisterData = {
	name: string;
	email: string;
	password: string;
	password2: string;
	phone: string;
};

export const RegisterView: FC<IModalProps & IRegisterProps> = (props) => {
	const [t] = useTranslation('translations');
	const [processState, setProcessState] = useState(false);
	const [getViewState, setViewState] = useState<'register' | 'terms'>('register');

	const onFinish = async (values: TRegisterData) => {
		setProcessState(true);
		if (values.password !== values.password2) {
			Antd.message.error(t('Passwords er ikke ens!'));
			setProcessState(false);
		} else {
			createUser(values.name, values.email, values.password, values.phone)
				.then(() => {
					Antd.message.success(t('Bruger oprettet.'));
					props.onClose?.();
					setProcessState(false);
				})
				.catch((err) => {
					if (err.includes('auth/weak-password')) {
						Antd.message.error(t('Kodeordet er for svagt. Det skal være mindst 6 bogstaver.'));
						setProcessState(false);
					} else {
						Antd.message.error(t('Brugeren kunne ikke oprettes. Tjek de indtastede oplysninger og prøv igen.'));
						setProcessState(false);
					}
				});
		}
	};

	const footerButtons = (
		<>
			{processState ? (
				<Antd.Button className={'modal-160-button'} type={'default'} htmlType={'submit'}>
					<LoaderSpin />
				</Antd.Button>
			) : getViewState === 'register' ? (
				[
					<Antd.Button key={'regBackBtn'} type={'default'} onClick={() => props.onClose?.()}>
						{t('Tilbage')}
					</Antd.Button>,
					<Antd.Button key={'regSubmitBtn'} className={'modal-160-button'} form={'create_user'} type={'primary'} htmlType={'submit'}>
						{t('Opret bruger')}
					</Antd.Button>,
				]
			) : (
				<Antd.Button key={'termsBackBtn'} type={'primary'} onClick={() => setViewState('register')}>
					{t('Tilbage')}
				</Antd.Button>
			)}{' '}
			<br></br>
			{t('Eller ')}
			<a
				className={'modal-link'}
				onClick={() => {
					props.loginState?.();
					setViewState('register');
				}}>
				{t('log ind')}
			</a>
		</>
	);

	return (
		<Modal
			{...props}
			closable={false}
			footer={[footerButtons]}
			onClose={() => {
				setViewState('register');
				props.onClose?.();
			}}
			title={
				<div className={'modalHeader register'}>
					{t(getViewState === 'register' ? 'Ny bruger' : 'Betingelser for brug af Naviair UTM')}
					<LanguageDropdown placement={'bottomRight'} className={'language-dropdown'} />
				</div>
			}>
			{getViewState === 'register' ? (
				<div className={'modal-content'}>
					<Antd.Form name={'create_user'} initialValues={{ remember: true, prefix: '45' }} onFinish={onFinish}>
						<RegisterInput
							autoFocus
							inputName={'name'}
							rules={[{ required: true, message: t('Navn er ikke gyldigt.') }]}
							icon={'user'}
							placeholder={t('Navn')}
						/>
						<RegisterInput
							inputName={'email'}
							rules={[{ required: true, message: t('Email er ikke gyldig.'), type: 'email' }]}
							icon={'at'}
							placeholder={'Email'}
						/>
						<RegisterInput
							inputName={'password'}
							rules={[{ required: true, message: t('Password er ikke gyldigt.') }]}
							inputType={'password'}
							icon={'key'}
							placeholder={'Password'}
						/>
						<RegisterInput inputName={'password2'} rules={[{}]} inputType={'password'} icon={'lock'} placeholder={t('Gentag password')} />
						<Antd.Form.Item name={'phone'} rules={[{ required: false }]}>
							<Antd.Input
								type={'tel'}
								prefix={<Icon name={'phone'} icon={faPhone} type={EIconTypes.LIGHT} />}
								addonBefore={
									<Antd.Form.Item name={'prefix'} noStyle>
										<Antd.Select>
											<Option value={'45'}>{'+45'}</Option>
										</Antd.Select>
									</Antd.Form.Item>
								}
								placeholder={t('Mobil')}
							/>
						</Antd.Form.Item>
						<Antd.Typography>
							{t('Ved at oprette en bruger accepterer du samtidig betingelserne for brug af Naviair UTM som kan findes')}{' '}
							<a onClick={() => setViewState('terms')}>{t('her')}</a>
							{'.'}
						</Antd.Typography>
					</Antd.Form>
				</div>
			) : (
				<Document {...props.docTerms} />
			)}
		</Modal>
	);
};

/* eslint-enable @typescript-eslint/no-unnecessary-condition */
