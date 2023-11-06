import React, { useEffect, useState, useRef } from 'react';
import { Antd } from '../..';
import { Styles } from '../../../../Styles/Styles';
import './styles.scss';

import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ITableFilterProps<T> {
	data: T[];
	onActiveChange: (id: string) => void;
	collapse?: boolean;
	translations: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TableFilter = <T extends { typeFilter?: string | number }>(props: ITableFilterProps<T>): JSX.Element => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [getTypeState, setTypeState] = useState<{ [key: string]: number }>({});
	const [getActiveFilterState, setActiveFilterState] = useState<string>('*');
	const [t] = useTranslation('translations');

	const getTitle = (key: string) => (key === '*' ? t('Alle') : props.translations[key] ? props.translations[key] : t('Ukendt'));

	const typeArr = (filterActive?: boolean) =>
		Object.keys(getTypeState)
			.filter((item) => {
				if ((filterActive && item !== getActiveFilterState) || !filterActive) {
					return item;
				}
			})
			.sort((a, b) => {
				if (a === '*') {
					return -1;
				} else {
					return Number(a) - Number(b);
				}
			});

	useEffect(() => {
		props.onActiveChange(getActiveFilterState);
	}, [getActiveFilterState]);

	//Set types
	useEffect(() => {
		const values: { [key: string]: number } = {
			'*': 0,
		};
		props.data.map((value) => {
			if (value.typeFilter !== undefined) {
				values['*'] = values['*'] + 1;
				values[String(value.typeFilter)] = values[String(value.typeFilter)] ? values[String(value.typeFilter)] + 1 : 1;
			}
		});
		setTypeState(values);
	}, [props.data]);

	const MenuCollapsed = () => (
		<Antd.Menu selectable={false}>
			{typeArr().map((key, index) => {
				return (
					<Antd.Menu.Item key={`menuTableFilterKey${index}`}>
						<TableFilterBadge
							title={getTitle(key)}
							value={key}
							count={getTypeState[key]}
							activeKey={getActiveFilterState}
							onClick={(key) => setActiveFilterState(key)}
							left
						/>
					</Antd.Menu.Item>
				);
			})}
		</Antd.Menu>
	);

	return props.collapse ? (
		<div className={'tableFilterCollapse'}>
			<Antd.Dropdown trigger={['click', 'hover']} overlay={<MenuCollapsed />} overlayClassName={'tableFilterCollapseContent'}>
				<div className={'tableFilterBadgeDiv'}>
					<TableFilterBadge
						title={getTitle(getActiveFilterState)}
						value={getActiveFilterState}
						count={getTypeState[getActiveFilterState]}
						activeKey={getActiveFilterState}
						left
					/>
				</div>
			</Antd.Dropdown>
		</div>
	) : (
		<div className={'tableFilter'} ref={containerRef}>
			{typeArr().map((key, index) => {
				return (
					<TableFilterBadge
						key={`tableFilterItem${index}`}
						title={getTitle(key)}
						value={key}
						count={getTypeState[key]}
						activeKey={getActiveFilterState}
						onClick={(key) => setActiveFilterState(key)}
					/>
				);
			})}
		</div>
	);
};

const TableFilterBadge: React.FC<{ value: string; title: string; activeKey: string; count: number; onClick?: (key: string) => void; left?: boolean }> = (
	props
) => {
	const active = props.activeKey === props.value ? true : false;

	/**
	 * Done like this because the ANTD module does not support it as CSS class
	 */
	const style = {
		default: {
			backgroundColor: Styles.White,
			borderColor: Styles.BrandColor,
			color: Styles.BrandColor,
		},
		active: {
			backgroundColor: Styles.BrandColor,
			color: Styles.White,
		},
	};

	return (
		<div className={`tableFilterBadge ${active && '-active'} ${props.left && '-left'}`} onClick={() => props.onClick?.(props.value)}>
			{props.title}
			{/* eslint-disable-next-line react/forbid-component-props*/}
			<Antd.Badge className={'badge'} style={active ? style.active : style.default} count={props.count} />
		</div>
	);
};
