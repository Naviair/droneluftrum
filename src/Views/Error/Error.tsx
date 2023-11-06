import React, { useEffect, useState } from 'react';
import HttpStatus from 'http-status-codes';
import { Card, EIconTypes, Icon, SingleLayout } from '@naviair-utm/react-shared-components';
import { RouteComponentProps } from 'react-router-dom';
import { errorCodesProxy } from './errorCodes';
import { useTranslation } from 'react-i18next';
import './styles.scss';
import { Antd } from '../../Components';

interface IErrorViewProps {
	errorCode: string;
}

export const ErrorView: React.FC<RouteComponentProps<IErrorViewProps>> = (props) => {
	const [t] = useTranslation('translations');

	const [error, setError] = useState<{ code?: string; message?: { header?: string; content?: string } }>({});

	useEffect(() => {
		const errorCode: string = props.match.params.errorCode;
		let errorMessage: { header?: string; content?: string } = {};
		try {
			errorMessage.header = HttpStatus.getStatusText(Number(errorCode));
		} catch (err) {
			errorMessage = errorCodesProxy[errorCode];
		}
		setError({ code: errorCode, message: errorMessage });
	}, []);

	return (
		<SingleLayout>
			<div className={'error_content'}>
				<Card fill textAlign={'center'} type={'small'} title={t('Beklager! - der skete en fejl')} icon={'exclamation-circle'}>
					<h3>
						{t('Error')} {error.code}
					</h3>
					<div>
						{error.message?.header && error.message.header}
						{error.message?.content && (
							<div
								dangerouslySetInnerHTML={{
									// eslint-disable-next-line @typescript-eslint/naming-convention
									__html: error.message.content,
								}}
							/>
						)}
					</div>
					<div className={'errorBtnContainer'}>
						<Antd.Button onClick={() => props.history.push('/')} type={'primary'} shape={'round'} icon={<Icon name={'home'} type={EIconTypes.REGULAR} />}>
							{t('Tilbage')}
						</Antd.Button>
					</div>
				</Card>
			</div>
		</SingleLayout>
	);
};
