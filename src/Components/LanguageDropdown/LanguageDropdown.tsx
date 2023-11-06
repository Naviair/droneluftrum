import React, { FC } from 'react';
import { Antd } from '../Common';
import { useTranslation } from 'react-i18next';
import { Recoil, useSetRecoilState, useRecoilValue } from '../../Recoil';
import { MenuItem } from '../../Views/App/User/UserDropdown/UserDropdown';
import { DropDown } from '@naviair-utm/react-shared-components';
import { faGlobeAfrica } from '@fortawesome/pro-regular-svg-icons/faGlobeAfrica';
import './styles.scss';
interface ILanguageDropdownProps {
	className?: string;
	placement?: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | undefined;
}

export const LanguageDropdown: FC<ILanguageDropdownProps> = (props: ILanguageDropdownProps) => {
	const setLanguage = useSetRecoilState(Recoil.Language.Selector);
	const [t] = useTranslation('translations');
	return (
		<DropDown
			icon={faGlobeAfrica}
			{...props}
			trigger={useRecoilValue(Recoil.DropDownTrigger.Selector)}
			overlay={
				<Antd.Menu className={'dropdown-menu'}>
					<>
						<div className={'header-div'}>
							<Antd.Typography.Text className={'opacity-text'}>{t('Skift sprog')}</Antd.Typography.Text>
						</div>
						<Antd.Divider />
						<MenuItem itemKey={'da'} onClick={() => setLanguage('da-DK')} iconAlternative={'da'} itemName={'Dansk'} />
						<MenuItem itemKey={'en'} onClick={() => setLanguage('en-US')} iconAlternative={'en'} itemName={'English'} />
					</>
				</Antd.Menu>
			}></DropDown>
	);
};
