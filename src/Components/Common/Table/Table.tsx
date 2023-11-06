import React, { useEffect, useState } from 'react';
import { Antd, TableFilter } from '..';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useModalState } from '../../../Hooks';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ITableViewProps<T> {
	columns: ColumnsType<T>;
	dataSource: T[];
	onDelete?: (id: string) => Promise<void>;
	formData: JSX.Element;
	onSearch?: (value: string) => void;
	onAdd: (data: T) => Promise<void>;
	onUpdate: (data: T) => Promise<void>;
	fullscreen?: boolean;
	children?: JSX.Element;
	style?: {
		labelSpan?: number;
		wrapperSpan?: number;
		labelAlign?: 'left' | 'right';
	};

	typeFilter?: boolean;
	typeFilterField?: string;
	typeTranslations?: { [key: number]: string };
	onActiveItemChange?: (activeItem?: T) => void;
	onDownloadClick?: () => Promise<void>;
	onFormReset?: () => void;
	loading?: boolean;
	dependencies?: {
		length?: number;
		noMobile?: boolean;
	};
	routeTranslations?: { [key: string]: string };
	pageName: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Table = <T extends { _id?: string; name?: string; typeFilter?: string | number }>(props: ITableViewProps<T>): JSX.Element => {
	const [t] = useTranslation('translations');
	const { isOpen, onOpen, onClose, setActive, activeItem } = useModalState<T>();
	const [getTypeFilter, setTypeFilter] = useState<string>();
	const [form] = Antd.Form.useForm();
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	const [getFilteredDataSource, setFilteredDataSource] = useState<T[]>([]);
	const [getSaveLoadingState, setSaveLoadingState] = useState<boolean>(false);
	const [getDonwloadLoadingState, setDownloadLoadingState] = useState<boolean>(false);
	const [getDataSourceState, setDataSourceState] = useState<T[]>([]);
	const [modal, modalContextHolder] = Antd.Modal.useModal();

	//TODO: Should be optimized
	const handleFilteredState = (dataSource: T[]) => {
		if (screenTypeS === EScreenType.MOBILE) {
			setTypeFilter(undefined);
		}

		if (getTypeFilter === undefined || getTypeFilter === '*') {
			setFilteredDataSource(dataSource);
		} else {
			setFilteredDataSource(dataSource.filter((item) => item.typeFilter === getTypeFilter));
		}
	};

	useEffect(() => {
		//Handle fields that is other than type
		const dataSource = props.typeFilterField
			? props.dataSource.map((value) => {
					const data = value;
					data.typeFilter = props.typeFilterField ? String(data[props.typeFilterField as keyof T]) : undefined;
					return data;
			  })
			: props.dataSource;
		setDataSourceState(dataSource);
		setFilteredDataSource(dataSource);
		handleFilteredState(dataSource);
	}, [screenTypeS, getTypeFilter, props.dataSource]);

	useEffect(() => {
		if (activeItem) {
			form.resetFields();
			props.onFormReset?.();
			form.setFieldsValue(activeItem);
			onOpen();
		}
		if (props.onActiveItemChange) {
			props.onActiveItemChange(activeItem as T);
		}
	}, [activeItem]);

	const showModal = (title: string, content: string) => {
		modal.info({ title: title, content: content, maskClosable: true, mask: true, centered: true });
	};

	const handleAdd = () => {
		if (screenTypeS === EScreenType.MOBILE && props.dependencies?.noMobile) {
			showModal(t('Funktionen er ikke tilgængelig på mobil'), t('Det er kun muligt at se, oprette og redigere operationer på desktop og tablet.'));
		} else if (props.dependencies?.length === 0) {
			showModal(t('Du har intet udstyr'), t('Du kan ikke oprette en operation uden udstyr. Opret venligst udstyr før du fortsætter.'));
		} else {
			form.resetFields();
			props.onFormReset?.();
			onOpen();
		}
	};

	const handleDelete = (id?: string, name?: string) => {
		id &&
			props.onDelete &&
			props
				.onDelete(id)
				.then(() => {
					Antd.message.success(`${name} ${t('er slettet')}!`);
				})
				.catch((err) => {
					Antd.message.error(`${err}`);
				});
	};

	const handleSave = (values: T) => {
		setSaveLoadingState(true);
		if (values._id) {
			props
				.onUpdate(values)
				.then(() => {
					Antd.message.success(t('Data opdateret!'));
					onClose();
				})
				.catch((err) => {
					Antd.message.error(`${err}`);
				})
				.finally(() => setSaveLoadingState(false));
		} else {
			props
				.onAdd(values)
				.then(() => {
					Antd.message.success(t('Data gemt!'));
					onClose();
				})
				.catch((err) => {
					Antd.message.error(`${err}`);
				})
				.finally(() => setSaveLoadingState(false));
		}
	};

	const handleCancel = () => {
		modal.confirm({
			title: t('Annuller'),
			content: t('Sikker på at du vil annullere?'),
			cancelText: t('Annuller'),
			onOk: onClose,
		});
	};

	const handleEdit = (record: T) => {
		if (screenTypeS === EScreenType.MOBILE && props.dependencies?.noMobile) {
			showModal(t('Funktionen er ikke tilgængelig på mobil'), t('Det er kun muligt at se, oprette og redigere operationer på desktop og tablet.'));
		} else {
			setActive(record);
		}
	};

	const handleDownload = () => {
		setDownloadLoadingState(true);
		props
			.onDownloadClick?.()
			.then(() => {
				Antd.message.success(t('Download påbegyndt!'));
			})
			.catch((err) => {
				Antd.message.error(`${err}`);
			})
			.finally(() => setDownloadLoadingState(false));
	};

	const operation: ColumnsType<T> = [
		{
			dataIndex: 'operation',
			align: 'right',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			render: (_: T, record: T) => {
				return (
					<Antd.Space>
						<Antd.Button type={'link'} icon={<EditOutlined className={'tableButton'} />} onClick={() => handleEdit(record)} />
						{props.onDelete && (
							<Antd.Popconfirm
								title={`${t('Sikker på du vil slette')} ${record.name}?`}
								okText={t('Slet')}
								cancelText={t('Annuller')}
								onConfirm={() => handleDelete(record._id, record.name)}>
								<Antd.Button type={'link'} icon={<DeleteOutlined className={'tableButton'} />} />
							</Antd.Popconfirm>
						)}
					</Antd.Space>
				);
			},
		},
	];
	const header = (title: string) => {
		return (
			<div className={'modalHeader'}>
				<div className={'left'}>{title}</div>
				{props.onDownloadClick && (
					<div className={'right'}>
						<Antd.Button onClick={handleDownload} loading={getDonwloadLoadingState} icon={<DownloadOutlined />} type={'primary'}>
							{t('Eksport')}
						</Antd.Button>
					</div>
				)}
			</div>
		);
	};

	const { style } = props;

	return (
		<>
			<div className={'list_header'}>
				<div className={'section left'}>
					<Antd.Button disabled={props.loading} key={'add'} type={'primary'} icon={<PlusOutlined />} onClick={handleAdd}>
						{t('Tilføj')}
					</Antd.Button>
					{screenTypeS !== EScreenType.MOBILE && props.typeFilter && props.typeTranslations && (
						<TableFilter<T> translations={props.typeTranslations} data={getDataSourceState} onActiveChange={setTypeFilter} />
					)}
				</div>
				<div className={'section right'}>
					<Antd.Space>
						<Antd.Input.Search onSearch={props.onSearch} allowClear />
					</Antd.Space>
				</div>
			</div>
			<Antd.Divider />
			<ConfigProvider locale={useRecoilValue(Recoil.Locale.Selector)}>
				<Antd.Table
					showSorterTooltip
					size={screenTypeS === EScreenType.MOBILE ? 'small' : 'large'}
					scroll={{ x: true }}
					columns={props.columns.concat(operation)}
					dataSource={getFilteredDataSource}
					loading={props.loading}
					rowKey={'_id'}
				/>
			</ConfigProvider>
			<Antd.Drawer
				visible={isOpen}
				onClose={handleCancel}
				width={props.fullscreen || screenTypeS === EScreenType.MOBILE ? '100%' : '50%'}
				closable={false}
				push={false}
				footer={
					<div className={'tableEditFooterWrapper'}>
						<Antd.Button onClick={handleCancel} className={'cancelButton'}>
							{t('Annuller')}
						</Antd.Button>
						<Antd.Button type={'primary'} loading={getSaveLoadingState} onClick={() => form.submit()}>
							{t('Gem')}
						</Antd.Button>
					</div>
				}>
				{header((activeItem ? t('Rediger') : t('Opret')) + ' ' + props.pageName.toLowerCase())}
				<Antd.Form<T>
					form={form}
					labelCol={{ span: style?.labelSpan ? style.labelSpan : 6 }}
					wrapperCol={{ span: style?.wrapperSpan ? style.wrapperSpan : 14 }}
					onFinish={handleSave}
					initialValues={{}}
					preserve={false}
					labelAlign={style?.labelAlign ? style.labelAlign : 'left'}>
					<Antd.Form.Item name={'_id'} hidden>
						<Antd.Input />
					</Antd.Form.Item>
					{props.formData}
				</Antd.Form>
				<div className={'tableChildrenWrapper'}>{props.children}</div>
			</Antd.Drawer>
			<div>{modalContextHolder}</div>
		</>
	);
};
