import React, { useState } from 'react';
import { Antd } from '../Antd';
import { Document } from '../../Document/Document';
import { IDocument } from '@naviair-utm/node-shared-interfaces';
import { useTranslation } from 'react-i18next';
import { LanguageDropdown } from '../../LanguageDropdown';
import { Modal } from '@naviair-utm/react-shared-components';
import './styles.scss';

interface IDisclaimerWarningProps {
	visible: boolean;
	onAccept: () => void;
	docAccept: IDocument;
	docTerms: IDocument;
}

export const DisclaimerWarning: React.FC<IDisclaimerWarningProps> = (props) => {
	const [getViewState, setViewState] = useState<'accept' | 'terms'>('accept');
	const [t] = useTranslation('translations');

	//Set the buttons on the view
	const buttons = [
		<Antd.Button key={'submit'} type={'primary'} onClick={props.onAccept}>
			{t('Accepter')}
		</Antd.Button>,
	];
	getViewState === 'terms' &&
		buttons.unshift(
			<Antd.Button key={'back'} type={'default'} onClick={() => setViewState('accept')}>
				{t('Tilbage')}
			</Antd.Button>
		);

	return (
		<Modal
			title={
				<div className={'modal_header'}>
					{t('Betingelser for brug af Naviair UTM')}
					<LanguageDropdown placement={'bottomRight'} className={'language-dropdown'} />
				</div>
			}
			draggable={false}
			closable={false}
			visible={props.visible}
			footer={buttons}
			key={'randomkey'}>
			{getViewState === 'accept' ? (
				<Document {...props.docAccept}>
					<div>
						{t('Brugervilkårene kan findes')} <a onClick={() => setViewState('terms')}>{t('her')}</a>
					</div>
				</Document>
			) : (
				<Document {...props.docTerms} />
			)}
		</Modal>
	);
};
