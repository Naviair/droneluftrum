import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Antd } from '../../../../Components/Common/Antd';
import { EOperationStatus, IOperationDetails, TEquiment } from '@naviair-utm/node-shared-interfaces';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import { Form } from '../../../../Components/Common';
import { TSelectData } from '../../../../Components/Common/Form/Select';
import { Moment } from 'moment-timezone';
import { equipmentApiHook } from '../../../../Api';

interface IDetailsViewProps {
	data?: IDetailsViewFormData;
	equipment: TEquiment[];
}

export interface IDetailsViewRef {
	validate: () => Promise<IDetailsViewFormData>;
	clear: () => void;
}

export interface IDetailsViewFormData extends Omit<IOperationDetails, 'period' | 'equipment'> {
	period: [Moment, Moment];
	equipment: string[];
}

export const DetailsView = forwardRef<IDetailsViewRef, React.PropsWithChildren<IDetailsViewProps>>((props, ref) => {
	const [t] = useTranslation('translations');
	const [form] = Antd.Form.useForm<IDetailsViewFormData>();

	useImperativeHandle(ref, () => ({
		validate: () => handleValidate(),
		clear: () => form.resetFields(),
	}));

	useEffect(() => {
		if (props.data) {
			form.setFieldsValue(props.data);
		} else {
			form.resetFields();
		}
	}, [props.data]);

	const handleValidate = (): Promise<IDetailsViewFormData> => {
		return new Promise((resolve, reject) => {
			form
				.validateFields()
				.then(() => {
					resolve(form.getFieldsValue(true));
				})
				.catch(() => {
					reject(t('Udfyld venligst alle påkrævede felter'));
				});
		});
	};

	const statusTranslations = {
		[EOperationStatus.DRAFT]: t('Udkast'),
		[EOperationStatus.HISTORIC]: t('Historisk'),
		[EOperationStatus.PLANNED]: t('Planlagt'),
	};

	const statusMenu = () => {
		return (
			<Antd.Menu>
				{Object.keys(EOperationStatus).map((item, index) => {
					return <Antd.Menu.Item key={`menuTag${index}`}>{statusTranslations[item as EOperationStatus]}</Antd.Menu.Item>;
				})}
			</Antd.Menu>
		);
	};

	return (
		<>
			<Antd.Card
				size={'small'}
				title={t('Detaljer')}
				className={'operationCard'}
				/*extra={
					<div>
						<Antd.Dropdown overlay={statusMenu}>
							<Antd.Tag>{t('Udkast')}</Antd.Tag>
						</Antd.Dropdown>
					</div>
				}*/
			>
				<Antd.Form<IDetailsViewFormData> labelAlign={'left'} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} form={form}>
					<Form.TextInput name={'name'} label={t('Operationsnavn')} required />
					<Form.DateInput name={'period'} label={t('Operationsperiode')} required />
					<Form.Select
						name={'status'}
						label={t('Status')}
						placeholder={t('Vælg status')}
						data={Object.keys(statusTranslations).map((item) => {
							return { value: item, label: statusTranslations[item as EOperationStatus] };
						})}
						required
					/>
					<Form.TextInput name={'purpose'} label={t('Formål')} required />
					<Form.Select
						name={'equipment'}
						label={t('Udstyr')}
						placeholder={t('Vælg udstyr')}
						data={props.equipment.map((item) => {
							return { value: item._id, label: `${item.name}` } as TSelectData;
						})}
						multiselect
						required
					/>
					<Form.TextInput multiline name={'notes'} label={t('Noter')} />
				</Antd.Form>
			</Antd.Card>
		</>
	);
});
