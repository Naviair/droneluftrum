/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { FC, useEffect, useState } from 'react';
import { Antd, LoaderSpin } from '../../../../Components/Common';
import { EIconTypes, IconName, IModalProps, Modal, Icon } from '@naviair-utm/react-shared-components';
import { fbAuth, TLoginData } from '../../../../Firebase';
import { useTranslation } from 'react-i18next';
import { Recoil, useSetRecoilState } from '../../../../Recoil';
import '../styles.scss';
import { Rule } from 'antd/lib/form';

interface ILoginInputProps {
	inputDisabled?: boolean;
	placeholder: string;
	inputName: string;
	inputType?: string;
	id: string;
	autoFocus?: boolean;
	rules?: Rule[];
	icon: IconName;
}

const LoginInput: React.FC<ILoginInputProps> = (props) => {
	return (
		<Antd.Form.Item key={`${props.id}_${props.inputName}`} name={props.inputName} rules={props.rules}>
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
interface ILoginProps extends IModalProps {
	signUpState?: () => void;
	resetState?: () => void;
	id: string;
	showWarning?: boolean;
}

export const LoginView: FC<ILoginProps> = (props) => {
	const [getLoadingState, setLoadingState] = useState(false);
	const [t] = useTranslation('translations');
	const [, , login, , getLoginStatus] = fbAuth();
	const setLoginRS = useSetRecoilState(Recoil.LoginModal.Atom);

	// Make sure modal does not show or disappears if user is already logged in.
	useEffect(() => {
		if (getLoginStatus()) {
			setLoginRS(false);
		}
		if (props.showWarning) {
			Antd.message.warning(t('Denne funktionalitet kræver, at du er logget ind'));
		}
	}, []);

	const onLoginFinish = (input: TLoginData) => {
		setLoadingState(true);
		login(input)
			.then(() => {
				Antd.message.success(t('Du er nu logget ind.'));
				props.onClose?.();
				setLoadingState(false);
			})
			.catch(() => {
				setLoadingState(false);
				Antd.message.error(t('De indtastede oplysninger er ikke korrekte.'));
			});
	};

	const footerButtons = (
		<>
			{getLoadingState ? (
				<Antd.Button className={'modal-130-button'} type={'default'}>
					<LoaderSpin />
				</Antd.Button>
			) : (
				<Antd.Button form={`${props.id}_login`} className={'modal-130-button'} type={'primary'} htmlType={'submit'}>
					{t('Log ind')}
				</Antd.Button>
			)}
		</>
	);

	return (
		<Modal {...props} footer={[footerButtons]} wrapClassName={'loginModalWrap'}>
			<div className={'modal-content'}>
				<h4>{t('Log ind')}</h4>
				<Antd.Divider />

				<Antd.Form key={props.id} name={`${props.id}_login`} initialValues={{ remember: true }} onFinish={onLoginFinish}>
					<LoginInput
						autoFocus
						id={props.id}
						inputName={'mail'}
						rules={[{ required: true, message: t('Brugernavn er ikke gyldigt.') }]}
						icon={'user'}
						placeholder={'Email'}
					/>
					<LoginInput
						id={props.id}
						inputName={'password'}
						rules={[{ required: true, message: t('Password er ikke gyldigt.') }]}
						inputType={'password'}
						icon={'key'}
						placeholder={'Password'}
					/>
					<Antd.Form.Item id={`${props.id}_external-links`}>
						<Antd.Form.Item id={`${props.id}_remember`} name={'remember'} valuePropName={'checked'} noStyle>
							<Antd.Checkbox>{t('Husk mig')}</Antd.Checkbox>
						</Antd.Form.Item>{' '}
						<br></br>
						<a className={'modal-link'} onClick={props.resetState}>
							{t('Glemt password?')}
						</a>{' '}
						<br></br>
						{t('Eller ')}
						<a className={'modal-link'} onClick={props.signUpState}>
							{t('opret en bruger')}
						</a>
					</Antd.Form.Item>
				</Antd.Form>
			</div>
		</Modal>
	);
};
/* eslint-enable @typescript-eslint/no-unnecessary-condition */
