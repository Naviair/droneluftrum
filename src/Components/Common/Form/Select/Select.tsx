import { FormItemProps } from 'antd';
import { SelectValue } from 'antd/lib/select';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../../..';

export type TSelectData = {
	value: string;
	label?: string;
};

export interface ISelectProps {
	name: string;
	label?: string | undefined;
	placeholder?: string | undefined;
	data: TSelectData[];
	required?: boolean;
	multiselect?: boolean;
	multiInline?: { width: number; spanWidth?: number };
	formItemProps?: FormItemProps;
	onChange?: (value: SelectValue) => void;
}

export const Select: React.FC<ISelectProps> = (props) => {
	const styles = props.multiInline
		? { display: 'inline-block', width: `calc(${props.multiInline.width}% - ${props.multiInline.spanWidth ? props.multiInline.spanWidth : 0}px)` }
		: {};
	const [t] = useTranslation('translations');

	return (
		<Antd.Form.Item
			key={props.name}
			name={props.name}
			label={props.label}
			rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}
			// eslint-disable-next-line react/forbid-component-props
			style={styles}
			{...props.formItemProps}>
			<Antd.Select placeholder={props.placeholder} mode={props.multiselect ? 'multiple' : undefined} dropdownMatchSelectWidth={false} onChange={props.onChange}>
				{props.data.map((value) => {
					return (
						<Antd.Select.Option key={`select_value_${value.value}`} value={value.value}>
							{value.label ? value.label : value.value}
						</Antd.Select.Option>
					);
				})}
			</Antd.Select>
		</Antd.Form.Item>
	);
};
