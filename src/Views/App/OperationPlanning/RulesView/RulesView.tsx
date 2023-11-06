import React, { FC, useEffect, useState } from 'react';
import { Antd } from '../../../../Components/Common/Antd';
import { InfoCircleFilled, ExclamationCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import './styles.scss';
import { useTranslation } from 'react-i18next';

//Sort order from value
export enum ERuleType {
	ERROR = 0,
	WARNING = 1,
	INFORMATION = 2,
}

export interface IRuleItemProps {
	title?: string;
	description?: string[];
	type: ERuleType;
}

const RuleItem: React.FC<IRuleItemProps> = (props) => {
	const ruleIcon = (type: ERuleType) => {
		switch (type) {
			case ERuleType.ERROR:
				return <CloseCircleFilled className={'ruleIconError'} />;
			case ERuleType.WARNING:
				return <ExclamationCircleFilled className={'ruleIconWarning'} />;
			case ERuleType.INFORMATION:
				return <InfoCircleFilled className={'ruleIconInformation'} />;
			default:
				break;
		}
	};

	const convertDescription = (descriptions?: string[]) => (
		<ul>
			{descriptions?.map((description, index) => (
				<li key={`description_${index}`}>{description}</li>
			))}
		</ul>
	);

	return (
		<Antd.List.Item>
			<Antd.List.Item.Meta avatar={ruleIcon(props.type)} title={props.title} description={convertDescription(props.description)} />
		</Antd.List.Item>
	);
};

interface IRulesView {
	data: IRuleItemProps[];
	loading?: boolean;
}

export const RulesView: FC<IRulesView> = (props) => {
	const [getSortedDataState, setSortedDataState] = useState<IRuleItemProps[]>([]);
	const [t] = useTranslation('translations');

	useEffect(() => {
		if (props.data.length > 0) {
			setSortedDataState(props.data.sort((a, b) => a.type - b.type));
		} else {
			setSortedDataState([]);
		}
	}, [props.data]);

	return (
		<div className={'cardWrapper'}>
			<Antd.Card size={'small'} title={t('Regler')}>
				<div className={'rulesContainer'}>
					<Antd.List<IRuleItemProps>
						loading={props.loading}
						itemLayout={'horizontal'}
						dataSource={getSortedDataState}
						size={'small'}
						locale={{ emptyText: t('Tegn område for at få vist regler!') }}
						renderItem={(item) => <RuleItem {...item} />}
					/>
				</div>
			</Antd.Card>
		</div>
	);
};
