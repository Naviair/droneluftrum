import React, { useState } from 'react';
import { Antd } from '../../../../Components/Common';
import { fbAuth } from '../../../../Firebase';
import { ProfileView, LoginView, RegisterView, ResetPassView } from '..';
import { useTranslation } from 'react-i18next';
import { EIconTypes, IconName, Modal, Icon, DropDown } from '@naviair-utm/react-shared-components';
import { Recoil, useRecoilState, useRecoilValue, useSetRecoilState } from '../../../../Recoil';
import { LanguageDropdown } from '../../../../Components/LanguageDropdown';
import { Document } from '../../../../Components';
import { faUser } from '@fortawesome/pro-regular-svg-icons/faUser';
import '../styles.scss';

interface IMenuItemProps {
	onClick?: () => void;
	icon?: IconName;
	iconAlternative?: string;
	itemName: string;
	itemKey: string;
}

export const MenuItem: React.FC<IMenuItemProps> = (props) => {
	const [t] = useTranslation('translations');

	return (
		<Antd.Menu.Item key={props.itemKey} onClick={props.onClick}>
			<Antd.Typography.Text>
				<Antd.Row>
					<div className={'title-menu-item'}>
						{props.icon ? <Icon name={props.icon} type={EIconTypes.REGULAR} /> : props.iconAlternative}
						<Antd.Divider type={'vertical'} />
					</div>
					<div>{t(props.itemName)}</div>
				</Antd.Row>
			</Antd.Typography.Text>
		</Antd.Menu.Item>
	);
};

export const UserDropdown: React.FC = () => {
	const [showLoginModal, setShowLoginModal] = useRecoilState(Recoil.LoginModal.Atom);
	const [showRegisterModal, setShowRegisterModal] = useRecoilState(Recoil.RegisterModal.Atom);
	const [showResetModal, setShowResetModal] = useRecoilState(Recoil.ResetModal.Atom);
	const setShowCookieRState = useSetRecoilState(Recoil.ShowCookie.Atom);
	const [showProfile, setShowProfile] = useState(false);
	const [getTermsViewState, setTermsViewState] = useState<boolean>(false);
	const [getAuthState, getUserState, , logout] = fbAuth();
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const [t] = useTranslation('translations');

	const logOut = () => {
		Antd.message.warning(t('Du blev logget ud.'));
		logout();
	};

	const showSignUp = () => {
		showLoginModal ? (setShowLoginModal(false), setShowRegisterModal(true)) : (setShowLoginModal(true), setShowRegisterModal(false));
	};

	const showReset = () => {
		showLoginModal ? (setShowLoginModal(false), setShowResetModal(true)) : (setShowLoginModal(true), setShowResetModal(false));
	};

	return (
		<>
			<DropDown
				// eslint-disable-next-line react/forbid-component-props
				icon={faUser}
				trigger={useRecoilValue(Recoil.DropDownTrigger.Selector)}
				overlay={
					<Antd.Menu key={'user-dropdown'} className={'dropdown-menu'}>
						{getAuthState ? (
							<>
								<div className={'header-div'}>
									<Antd.Typography.Text className={'opacity-text'}>{t('Logget ind som')}</Antd.Typography.Text>
									<a onClick={() => setShowProfile(true)}> {getUserState?.email}</a>
								</div>
								<Antd.Divider></Antd.Divider>
								<MenuItem itemKey={'profile'} itemName={'Min profil'} icon={'user'} onClick={() => setShowProfile(true)} />
								<MenuItem itemKey={'terms'} itemName={'Betingelser'} icon={'file-alt'} onClick={() => setTermsViewState(true)} />
								<MenuItem itemKey={'cookies'} itemName={'Cookies'} icon={'cookie-bite'} onClick={() => setShowCookieRState(true)} />
								<Antd.Divider></Antd.Divider>
								<MenuItem itemKey={'logout'} itemName={'Log ud'} icon={'sign-out'} onClick={logOut} />
							</>
						) : (
							<>
								<div className={'header-div'}>
									<Antd.Typography.Text className={'opacity-text'}>{t('Du er ikke logget ind.')}</Antd.Typography.Text>
								</div>
								<Antd.Divider />
								<MenuItem itemKey={'login'} itemName={'Log ind'} icon={'sign-in'} onClick={() => setShowLoginModal(true)} />
								<MenuItem itemKey={'create'} itemName={'Opret bruger'} icon={'user-plus'} onClick={() => setShowRegisterModal(true)} />
								<Antd.Divider></Antd.Divider>
								<MenuItem itemKey={'terms'} itemName={'Betingelser'} icon={'file-alt'} onClick={() => setTermsViewState(true)} />
								<MenuItem itemKey={'cookies'} itemName={'Cookies'} icon={'cookie-bite'} onClick={() => setShowCookieRState(true)} />
							</>
						)}
					</Antd.Menu>
				}></DropDown>
			<Modal
				title={
					<div className={'modalHeader'}>
						{t('Betingelser for brug af Naviair UTM')}
						<LanguageDropdown placement={'bottomRight'} className={'language-dropdown'} />
					</div>
				}
				draggable={false}
				closable={false}
				visible={getTermsViewState}
				onClose={() => setTermsViewState(false)} //allows maskClosable to work
				footer={[
					<Antd.Button key={'submit'} type={'primary'} onClick={() => setTermsViewState(false)}>
						{t('Luk')}
					</Antd.Button>,
				]}
				key={'termsModal'}>
				<Document {...configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].userTerms]} />
			</Modal>
			<ProfileView visible={showProfile} onClose={() => setShowProfile(false)} />
			<LoginView
				id={'dropdown'}
				visible={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				footerButtons={null}
				signUpState={() => showSignUp()}
				resetState={() => showReset()}
			/>
			<RegisterView
				visible={showRegisterModal}
				onClose={() => setShowRegisterModal(false)}
				footerButtons={null}
				loginState={() => showSignUp()}
				docTerms={configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].userTerms]}
			/>
			<ResetPassView visible={showResetModal} onClose={() => setShowResetModal(false)} footerButtons={null} loginState={() => showReset()} />
		</>
	);
};
