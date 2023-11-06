import React from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../../..';

export interface ITextInputProps {
	name: string;
	label?: string | undefined;
	required?: boolean;
	multiline?: boolean;
	addonBefore?: React.ReactNode;
	hidden?: boolean;
	autoComplete?: boolean;
	disabled?: boolean;
	multiInline?: { width: number; spanWidth?: number };
}

export const TextInput: React.FC<ITextInputProps> = (props) => {
	const styles = props.multiInline
		? { display: 'inline-block', width: `calc(${props.multiInline.width}% - ${props.multiInline.spanWidth ? props.multiInline.spanWidth : 0}px)` }
		: {};
	const [t] = useTranslation('translations');
	return (
		<Antd.Form.Item
			hidden={props.hidden ? props.hidden : false}
			key={props.name}
			name={props.name}
			label={props.label}
			rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}
			// eslint-disable-next-line react/forbid-component-props
			style={styles}>
			{props.multiline ? (
				<Antd.Input.TextArea disabled={props.disabled ? props.disabled : false} />
			) : (
				<Antd.Input autoComplete={props.autoComplete ? 'on' : 'off'} addonBefore={props.addonBefore} disabled={props.disabled ? props.disabled : false} />
			)}
		</Antd.Form.Item>
	);
};
