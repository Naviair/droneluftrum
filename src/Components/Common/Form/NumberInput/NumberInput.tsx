import { FormItemProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../../..';

export interface INumberInputProps {
	name: string;
	label?: string;
	required?: boolean;
	defaultValue?: number;
	prefix?: string;
	minValue?: number;
	maxValue?: number;
	toFixed?: number;
	multiInline?: { width: number; spanWidth?: number };
	formItemProps?: FormItemProps;
}

export const NumberInput: React.FC<INumberInputProps> = (props) => {
	const defaultValue = props.defaultValue ? props.defaultValue : 0;
	const styles = props.multiInline
		? { display: 'inline-block', width: `calc(${props.multiInline.width}% - ${props.multiInline.spanWidth ? props.multiInline.spanWidth : 0}px)` }
		: {};
	const [t] = useTranslation('translations');

	return (
		<Antd.Form.Item
			key={props.name}
			initialValue={defaultValue}
			name={props.name}
			label={props.label ? `${props.label}${props.prefix ? ` (${props.prefix})` : ''}` : undefined}
			rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}
			// eslint-disable-next-line react/forbid-component-props
			style={styles}
			{...props.formItemProps}>
			<Antd.InputNumber precision={props.toFixed} min={props.minValue} max={props.maxValue} />
		</Antd.Form.Item>
	);
};
