import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { Antd } from '../../..';
import './styles.scss';

export interface IDynamicInputProps {
	name: string;
	label: string;
}

export const DynamicInput: React.FC<IDynamicInputProps> = (props) => {
	return (
		<Antd.Form.List key={props.name} name={props.name}>
			{(fields, { add, remove }, { errors }) => {
				return (
					<>
						{fields.map((field, index) => (
							<Antd.Form.Item label={index === 0 ? props.label : ''} key={`row_${field.key}`} {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}>
								<Antd.Form.Item {...field} rules={[{ required: true }]} noStyle>
									<Antd.Input className={'dynamicInputInput'} />
								</Antd.Form.Item>
								<MinusCircleOutlined key={`button_${field.key}`} className={'dynamic-delete-button'} onClick={() => remove(field.name)} />
							</Antd.Form.Item>
						))}
						<Antd.Form.Item key={'add_button'} wrapperCol={{ span: 14, offset: 6 }}>
							<Antd.Button type={'dashed'} onClick={() => add()} className={'dynamicInputButton'} icon={<PlusOutlined />}>
								{'Tilføj '}
								{props.label.toLowerCase()}
							</Antd.Button>
							<Antd.Form.ErrorList errors={errors} />
						</Antd.Form.Item>
					</>
				);
			}}
		</Antd.Form.List>
	);
};

const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 14 },
};
const formItemLayoutWithOutLabel = {
	wrapperCol: {
		span: 14,
		offset: 6,
	},
};
