import React, { Suspense } from 'react';
const Nav = React.lazy(() => import('../../Nav'));
const NavMobile = React.lazy(() => import('../../NavMobile'));
import Logo from '../../../Assets/Brand/Logo.svg';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { Antd, LanguageDropdown, GeoSearch } from '../..';
import { UserDropdown } from '../../../Views/App';
import { useLocation } from 'react-router-dom';
import { useWindowDimensions, Header, LoadOverlay } from '@naviair-utm/react-shared-components';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';
import './styles.scss';

export const MainLayout: React.FC = (props) => {
	/* ScreenState listener */
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	/* Global app loading state. */
	const getGLoadingRState = useRecoilValue(Recoil.GeneralLoading.Atom);
	/* App configuration settings */
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	/* Used to get current browser location */
	const location = useLocation();
	/* Height hook */
	const { height } = useWindowDimensions();

	return (
		// eslint-disable-next-line react/forbid-dom-props
		<div className={'layout'} style={{ height: height }}>
			{getGLoadingRState && <LoadOverlay loading title={'Naviair UTM'} subtitle={'Powered by Naviair'} />}
			<Header
				left={<>{location.pathname === '/app/map' && <GeoSearch key={'geosearch-key'} configuration={configuration} />}</>}
				logo={<Logo />}
				right={
					<>
						<UserDropdown />
						{screenTypeS === EScreenType.DESKTOP ? <Antd.Divider type={'vertical'} /> : undefined}
						<LanguageDropdown />
					</>
				}
			/>
			<div className={`body${screenTypeS === EScreenType.MOBILE ? '-mobile' : ''}`}>
				{screenTypeS === EScreenType.DESKTOP && <Nav />}
				<div className={`content${screenTypeS === EScreenType.MOBILE ? '-mobile' : ''}`}>
					<Suspense fallback={<></>}>{props.children}</Suspense>
				</div>
			</div>
			{screenTypeS === EScreenType.MOBILE && <NavMobile />}
		</div>
	);
};
