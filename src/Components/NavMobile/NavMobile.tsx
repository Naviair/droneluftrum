import React from 'react';
import { EIconTypes, IconName, Icon } from '@naviair-utm/react-shared-components';
import { Link, useLocation } from 'react-router-dom';
import './styles.scss';
import { Recoil, useRecoilValue } from '../../Recoil';
import { TSettingsAppMenu } from '@naviair-utm/node-shared-interfaces';
import { useTranslation } from 'react-i18next';

const NavMobileListItem: React.FC<TSettingsAppMenu<IconName>> = (props) => {
	const location = useLocation();
	const [t] = useTranslation('translations');

	return (
		<>
			<Link
				/*onClick={() => { props.external && setModalState(true) }}*/ onClick={() => {
					props.external && window.open(props.link);
				}}
				to={props.external ? '#' : props.link}
				key={`nav_list_item_${props.name}`}>
				<div className={`item ${props.link === location.pathname ? '-active' : ''}`}>
					<span className={'icon'}>
						<Icon name={props.icon} type={props.link === location.pathname ? EIconTypes.SOLID : EIconTypes.LIGHT} />
					</span>
					<span className={'title'}>{t(props.title)}</span>
				</div>
			</Link>
			{/*props.external &&
        <IFrameModal url={props.link} show={getModalState} onClose={() => setModalState(false)} title={props.title} />
      */}
		</>
	);
};

const NavMobile: React.FC = () => {
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const menuConf = configuration.settings.app.menu;

	return (
		<div className={'nav_mobile'}>
			<div className={'list'}>
				{menuConf.map((item, i) => (
					<NavMobileListItem key={`nav_list_item_${i}`} {...item} />
				))}
			</div>
		</div>
	);
};

export default NavMobile;
