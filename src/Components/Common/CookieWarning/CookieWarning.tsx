import React, { useEffect, useState } from 'react';
import { Antd } from '../Antd';
import './styles.scss';
import { IDocument } from '@naviair-utm/node-shared-interfaces';
import { Document } from '../../Document/Document';
import { TAcceptedCookies } from '../../../Utils/CookieHandler';
import { useTranslation } from 'react-i18next';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { LanguageDropdown } from '../../LanguageDropdown';
import { Switch } from '../Switch';

interface ICookieWarningProps {
	visible: boolean;
	docTerms: IDocument;
	curAcceptedCookies: TAcceptedCookies;
	onAccept: (cookies: TAcceptedCookies) => void;
}

export const CookieWarning: React.FC<ICookieWarningProps> = (props) => {
	const [getViewState, setViewState] = useState<'settings' | 'info'>('settings');
	const [getNecessaryState, setNecessaryState] = useState<boolean>(false);
	const [getFunctionalityState, setFunctionalityState] = useState<boolean>(false);
	const [getStatisticsState, setStatisticsState] = useState<boolean>(false);
	const [getMarketingState, setMarketingState] = useState<boolean>(false);
	const [t] = useTranslation('translations');
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const activeLanguage = useRecoilValue(Recoil.Language.Atom);

	const columns = [
		{
			title: t('Navn'),
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: t('Sender'),
			dataIndex: 'sender',
			key: 'sender',
		},
		{
			title: t('Beskrivelse'),
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: t('Udløb'),
			dataIndex: 'expired',
			key: 'expired',
		},
	];

	const data = [
		{
			key: '1',
			name: '_terms',
			sender: 'Naviair',
			description: t('Accept af betingelser'),
			expired: 'Session',
		},
		{
			key: '2',
			name: '_cookieSettings',
			sender: 'Naviair',
			description: t('Cookie præferencer'),
			expired: `30 ${t('dage')}`,
		},
	];

	const data1 = [
		{
			key: '1',
			name: '_mapSettingsBackground',
			sender: 'Naviair',
			description: t('Valg af baggrundskort'),
			expired: `30 ${t('dage')}`,
		},
		{
			key: '2',
			name: '_mapSettingsLayers',
			sender: 'Naviair',
			description: t('Valgt visning af lag'),
			expired: `30 ${t('dage')}`,
		},
		{
			key: '3',
			name: '_mapSettingsLayerGroup',
			sender: 'Naviair',
			description: t('Valgt visning af laggruppe'),
			expired: `30 ${t('dage')}`,
		},
		{
			key: '4',
			name: '_languageSettings',
			sender: 'Naviair',
			description: t('Valg af sprog'),
			expired: `30 ${t('dage')}`,
		},
		{
			key: '5',
			name: '_terrainSettings',
			sender: 'Naviair',
			description: t('Valg af 3D terræn'),
			expired: `30 ${t('dage')}`,
		},
	];

	useEffect(() => {
		const cur = props.curAcceptedCookies;
		setNecessaryState(true);
		setFunctionalityState(cur.functionality);
		setStatisticsState(cur.statistics);
		setMarketingState(cur.marketing);
	}, [props.curAcceptedCookies]);

	const handleAccept = (all?: boolean) => {
		const response: TAcceptedCookies = {
			necessary: all ? true : getNecessaryState,
			marketing: all ? true : getMarketingState,
			statistics: all ? true : getStatisticsState,
			functionality: all ? true : getFunctionalityState,
		};
		props.onAccept(response);
	};

	//Set the buttons on the view
	const buttons =
		getViewState === 'settings'
			? [
					<Antd.Button key={'submitSelected'} type={'default'} onClick={() => handleAccept()}>
						{t('Tillad valgte cookies')}
					</Antd.Button>,
					<Antd.Button key={'submitAll'} type={'primary'} onClick={() => handleAccept(true)}>
						{t('Tillad alle cookies')}
					</Antd.Button>,
			  ]
			: [
					<Antd.Button key={'back'} type={'default'} onClick={() => setViewState('settings')}>
						{t('Tilbage')}
					</Antd.Button>,
			  ];

	return (
		<Antd.Modal
			title={
				<div className={'modal_header'}>
					{t('Cookies på Naviair UTM')}
					<LanguageDropdown placement={'bottomRight'} className={'language-dropdown'} />
				</div>
			}
			centered
			visible={props.visible}
			destroyOnClose={true}
			closable={false}
			footer={buttons}>
			{getViewState === 'settings' ? (
				<>
					<p>{t('Naviair UTM benytter cookies. Nedenfor kan du tage stilling til, om brugen af statistiske, funktionelle og marketingcookies.')}</p>
					<p>
						<a onClick={() => setViewState('info')}>{t('Læs mere om cookies her')}</a>
					</p>
					<div className={'cookie_content'}>
						<Antd.Collapse ghost accordion>
							<Antd.Panel
								header={t('Nødvendige')}
								extra={
									<Switch
										size={'default'}
										defaultChecked={getNecessaryState}
										disabled
										onClick={(checked, event) => {
											event.stopPropagation();
											setNecessaryState(checked);
										}}
									/>
								}
								key={'panel_necessary'}>
								<Document {...configuration.documents[configuration.settings.app.documents[activeLanguage].cookiesNecessary]}>
									<br />
									<br />
									<Antd.Table scroll={{ x: true }} columns={columns} dataSource={data} pagination={false} />
								</Document>
							</Antd.Panel>
							<Antd.Panel
								header={t('Funktionelle')}
								extra={
									<Switch
										size={'default'}
										defaultChecked={getFunctionalityState}
										onClick={(checked, event) => {
											event.stopPropagation();
											setFunctionalityState(checked);
										}}
									/>
								}
								key={'panel_functionality'}>
								<Document {...configuration.documents[configuration.settings.app.documents[activeLanguage].cookiesFunctional]}>
									<br />
									<br />
									<Antd.Table scroll={{ x: true }} columns={columns} dataSource={data1} pagination={false} />
								</Document>
							</Antd.Panel>
							<Antd.Panel
								header={t('Statistiske')}
								extra={
									<Switch
										size={'default'}
										defaultChecked={getStatisticsState}
										onClick={(checked, event) => {
											event.stopPropagation();
											setStatisticsState(checked);
										}}
									/>
								}
								key={'panel_statistics'}>
								<Document {...configuration.documents[configuration.settings.app.documents[activeLanguage].cookiesStatistical]}>
									<br />
									<br />
									<Antd.Table scroll={{ x: true }} columns={columns} dataSource={[]} pagination={false} />
								</Document>
							</Antd.Panel>
							<Antd.Panel
								header={t('Marketing')}
								extra={
									<Switch
										size={'default'}
										defaultChecked={getMarketingState}
										onClick={(checked, event) => {
											event.stopPropagation();
											setMarketingState(checked);
										}}
									/>
								}
								key={'switch_marketing'}>
								<Document {...configuration.documents[configuration.settings.app.documents[activeLanguage].cookiesMarketing]}>
									<br />
									<br />
									<Antd.Table scroll={{ x: true }} columns={columns} dataSource={[]} pagination={false} />
								</Document>
							</Antd.Panel>
						</Antd.Collapse>
					</div>
				</>
			) : (
				<Document {...props.docTerms} />
			)}
		</Antd.Modal>
	);
};
