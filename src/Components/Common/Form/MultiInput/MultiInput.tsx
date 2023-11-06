import React from 'react';
import { Antd } from '../../..';
import { Form } from '../';
import { ISelectProps } from '../Select';
import { INumberInputProps } from '../NumberInput';
import { useTranslation } from 'react-i18next';
import './styles.scss';

export type TMultiInputData = {
	value: string;
	label?: string;
};

export interface IMultiInputProps {
	label: string;
	numberInput: INumberInputProps;
	select: ISelectProps;
	required?: boolean;
}

export const MultiInput: React.FC<IMultiInputProps> = (props) => {
	const [t] = useTranslation('translations');
	return (
		<Antd.Form.Item
			label={props.label}
			required={props.required}
			rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}
			className={'multiInputFormItem'}>
			<Form.NumberInput {...props.numberInput} multiInline={{ width: 45, spanWidth: 5 }} required={props.required} />
			<span className={'multiInputSpan'} />
			<Form.Select {...props.select} multiInline={{ width: 55, spanWidth: 5 }} required={props.required} />
		</Antd.Form.Item>
	);
};
