import React from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../../..';
import locale_daDK from 'antd/es/locale/da_DK';
import locale_enGB from 'antd/es/locale/en_GB';
import { Recoil, useRecoilValue } from '../../../../Recoil';

export interface IDateInputProps {
	name: string;
	label?: string | undefined;
	required?: boolean;
	hidden?: boolean;
	placeholder?: string;
}

export const DateInput: React.FC<IDateInputProps> = (props) => {
	const [t] = useTranslation('translations');
	const getActiveLanguage = useRecoilValue(Recoil.Language.Atom);
	return (
		<Antd.ConfigProvider locale={getActiveLanguage === 'en-US' ? locale_enGB : locale_daDK}>
			<Antd.Form.Item
				hidden={props.hidden ? props.hidden : false}
				key={props.name}
				name={props.name}
				label={props.label}
				rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}>
				<Antd.RangePicker placeholder={[t('Start tidspunkt'), t('Slut tidspunkt')]} format={'DD-MM-YYYY HH:mm'} showTime />
			</Antd.Form.Item>
		</Antd.ConfigProvider>
	);
};
