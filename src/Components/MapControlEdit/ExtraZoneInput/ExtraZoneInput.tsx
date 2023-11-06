import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Antd } from '../..';
import { Form } from '../../Common/Form';
import { INumberInputProps } from '../../Common/Form/NumberInput';
import { ISelectProps } from '../../Common/Form/Select';
import './styles.scss';

export interface IExtraZoneInputProps {
	name: string;
	label: string;
	type: ISelectProps;
	value: INumberInputProps;
}

export const ExtraZoneInput: React.FC<IExtraZoneInputProps> = (props) => {
	const [t] = useTranslation('translations');
	return (
		<Antd.Form.List key={props.name} name={props.name}>
			{(fields, { add, remove }, { errors }) => {
				return (
					<>
						{fields.map((field, index) => (
							<div>
								<Antd.Form.Item
									label={index === 0 ? props.label : ''}
									key={`row_${field.key}`}
									style={{ position: 'relative' }}
									{...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}>
									<div className={'dynamic-wrapper'}>
										<Form.Select formItemProps={{ labelCol: { span: 8 } }} {...props.type} />
										<Form.NumberInput formItemProps={{ labelCol: { span: 8 }, style: { marginBottom: 0 } }} {...props.value} />
									</div>
									<div style={{ position: 'absolute', top: 0, right: -40 }}>
										{' '}
										{/*Not working with class */}
										<MinusCircleOutlined key={`button_${field.key}`} className={'dynamic-delete-button'} onClick={() => remove(field.name)} />
									</div>
								</Antd.Form.Item>
							</div>
						))}
						<Antd.Form.Item key={`add_button`} wrapperCol={{ span: 14, offset: 8 }}>
							<Antd.Button type={'dashed'} onClick={() => add()} icon={<PlusOutlined />}>
								{t('Tilføj')} {props.label.toLowerCase()}
							</Antd.Button>
							<Antd.Form.ErrorList errors={errors} />
						</Antd.Form.Item>
					</>
				);
			}}
		</Antd.Form.List>
	);
};
/*

*/

const formItemLayout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 14 },
};

const formItemLayoutWithOutLabel = {
	wrapperCol: {
		span: 14,
		offset: 8,
	},
};
