import React, { useEffect, useState } from 'react';
import { Switch, Redirect, RouteComponentProps } from 'react-router-dom';
import { Recoil, useRecoilState, useSetRecoilState, useRecoilValue } from '../../Recoil';
import { useMediaQuery } from 'react-responsive';
import { EScreenType, TStartupNotification } from '@naviair-utm/node-shared-interfaces';
import { CookieWarning } from '../../Components/Common/CookieWarning/CookieWarning';
import './styles.scss';
import { DisclaimerWarning } from '../../Components/Common/DisclaimerWarning/DisclaimerWarning';
import { CookieHandler, ECookies } from '../../Utils/CookieHandler';
import { Maintenance } from '../../Components/Maintenance/Maintenance';
import { ErrorBoundary } from '@naviair-utm/react-shared-components';
import { ApmRoute } from '@elastic/apm-rum-react';
import '../../Translation/i18n';
import { useTranslation } from 'react-i18next';
import { DocumentView, ListView, MapView, PageView } from '.';
import { UserView } from './UserView';
import { SecureRoute } from '../../Components/SecureRoute/SecureRoute';
import { MainLayout } from '../../Components/Layout/MainLayout/MainLayout';
import { InitIconLibrary } from '../../Utils/FaIconLibrary';
import { notification as antdNotification } from 'antd';
import moment from 'moment-timezone';

/* 
	Set timezone globally for project. This forces the timezone independent 
	of the browser/device timezone. If removed, it will affect the calculation 
	of zones, notams and operation plans!
*/
moment.tz.setDefault('Europe/Copenhagen');

const setTitle = (title: string) => {
	const portalName = title ? title : 'Loading...';
	document.title = portalName;
};

InitIconLibrary();

export const App: React.FC<RouteComponentProps> = (props) => {
	//Tmp open method for header
	const [getShowCookieRState, setShowCookieRState] = useRecoilState(Recoil.ShowCookie.Atom);
	useEffect(() => {
		if (getShowCookieRState) {
			setShowCookieState(true);
			setShowCookieRState(false);
		}
	}, [getShowCookieRState]);

	//State for disclaimer accept
	const [getShowDisclaimerState, setShowDisclaimerState] = useState(false);
	//State for cookie popup
	const [getShowCookieState, setShowCookieState] = useState(false);

	//Cookiehandler
	const { setCookie, getCookie, getAcceptedCookies, setAcceptedCookies } = CookieHandler();

	const handleAcceptDisclaimer = () => {
		setShowDisclaimerState(false);
		setCookie(ECookies.TERMS, 'accepted');
	};

	//Check if cookie and disclaimer should be shown
	useEffect(() => {
		if (!getCookie(ECookies.COOKIE_SETTINGS)) {
			setShowCookieState(true);
		} else if (!getCookie(ECookies.TERMS)) {
			setShowDisclaimerState(true);
		}
	}, [getShowCookieState, getShowDisclaimerState]);

	//Get configuration
	const configuration = useRecoilValue(Recoil.Configuration.Selector);

	useEffect(() => {
		setTitle(configuration.name);
		handleNotificationPopup(configuration.settings.app.startupNotification);
		const da = configuration.translations['da-DK'];
		const en = configuration.translations['en-US'];
		i18n.addResourceBundle(da.language, 'translations', da.content, undefined, true);
		i18n.addResourceBundle(en.language, 'translations', en.content, undefined, true);
	}, [configuration]);

	/**
	 * Handles notification popup if set in configuration
	 */
	const handleNotificationPopup = (notificationSettings?: TStartupNotification) => {
		if (
			(notificationSettings?.active && !notificationSettings.expire) ||
			(notificationSettings?.active && notificationSettings.expire && notificationSettings.expire > moment().unix())
		) {
			antdNotification.info({
				message: notificationSettings.title,
				description: (
					<div
						className={'notificationHtml'}
						dangerouslySetInnerHTML={{
							// eslint-disable-next-line @typescript-eslint/naming-convention
							__html: notificationSettings.description,
						}}
					/>
				),
				duration: notificationSettings.duration,
				className: 'notificationPopupContainer',
			});
		}
	};

	/**
	 * Handles translations
	 */
	const [, i18n] = useTranslation();
	const getLanguage = useRecoilValue(Recoil.Language.Atom);
	useEffect(() => {
		i18n.changeLanguage(getLanguage.toString());
	}, [getLanguage]);

	/**
	 * Set and detect about the app is Mobile or Desktop
	 */
	const setScreenTypeS = useSetRecoilState(Recoil.ScreenType.Atom);
	const setScreenLandscapeS = useSetRecoilState(Recoil.ScreenLandscape.Atom);
	const screenIsMobile = useMediaQuery({ maxWidth: 575 });
	const screenIsLandscape = useMediaQuery({ orientation: 'landscape', maxHeight: 550 });

	useEffect(() => {
		setScreenTypeS(screenIsMobile || screenIsLandscape ? EScreenType.MOBILE : EScreenType.DESKTOP);
		setScreenLandscapeS(screenIsLandscape);
	}, [screenIsMobile, screenIsLandscape]);

	return (
		<ErrorBoundary {...props}>
			{configuration.maintenence?.active ? (
				<Maintenance title={configuration.maintenence.title} subtitle={configuration.maintenence.subtitle} />
			) : (
				<MainLayout>
					<Switch>
						<Redirect exact path={`${props.match.url}/`} to={`${props.match.url}/map`} />
						<ApmRoute path={`${props.match.url}/map`} component={() => <MapView />} />
						{Object.keys(configuration.documents).map((docKey) => {
							const doc = configuration.documents[docKey];
							return <ApmRoute key={docKey} path={`${props.match.url}/documents/${docKey}`} component={() => <DocumentView document={doc} />} />;
						})}
						{Object.keys(configuration.pages[useRecoilValue(Recoil.Language.Atom)]).map((pageKey) => {
							return (
								<ApmRoute
									key={pageKey}
									path={`${props.match.url}/pages/${pageKey}`}
									component={() => <PageView page={configuration.pages[useRecoilValue(Recoil.Language.Atom)][pageKey]} />}
								/>
							);
						})}
						<SecureRoute path={`${props.match.url}/list/`} render={(props) => <ListView {...props} />} />
						{/*<ApmRoute key={'list'} path={`${props.match.url}/list/`} render={(props) => <ListView {...props} />} />*/}
						<ApmRoute key={'user'} path={`${props.match.url}/user/`} component={(props: RouteComponentProps) => <UserView {...props} />} />

						<Redirect path={'*'} to={'/error/404'} />
					</Switch>
					<CookieWarning
						visible={getShowCookieState}
						docTerms={configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].cookieTerms]}
						curAcceptedCookies={getAcceptedCookies()}
						onAccept={(cookies) => {
							setAcceptedCookies(cookies);
							setShowCookieState(false);
						}}
					/>
					<DisclaimerWarning
						onAccept={handleAcceptDisclaimer}
						visible={getShowDisclaimerState}
						docAccept={configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].acceptTerms]}
						docTerms={configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].userTerms]}
					/>
				</MainLayout>
			)}
		</ErrorBoundary>
	);
};
