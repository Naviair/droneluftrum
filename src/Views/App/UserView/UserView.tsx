import React, { useEffect, useState } from 'react';
import { Recoil, useSetRecoilState } from '../../../Recoil';
import { Redirect, RouteComponentProps, Switch } from 'react-router-dom';
import { ApmRoute } from '@elastic/apm-rum-react';
import { UserResetPass, UserConfirmEmail, UserRecoverEmail } from './';

interface IParameterValidation {
	mode: string;
	actionCode: string;
	continueUrl: string;
	lang: string;
}

export const UserView: React.FC<RouteComponentProps> = (props) => {
	const setGLoadingRState = useSetRecoilState(Recoil.GeneralLoading.Atom);
	const [params, setParams] = useState<IParameterValidation>();

	const getParams = (): PromiseLike<IParameterValidation> => {
		const urlSearchParams = new URLSearchParams(window.location.search);
		const params = Object.fromEntries(urlSearchParams.entries());
		return new Promise((resolve, reject) => {
			try {
				resolve({ mode: params['mode'], actionCode: params['oobCode'], continueUrl: params['continueUrl'], lang: params['lang'] });
			} catch (e) {
				reject(e);
			}
		});
	};

	useEffect(() => {
		getParams().then((result) => {
			setParams(result);
		});
		setGLoadingRState(false);
	}, []);

	return (
		<Switch>
			<ApmRoute
				exact
				path={`${props.match.url}`}
				render={() => {
					if (params) {
						{
							switch (params.mode) {
								case 'resetPassword':
									return <UserResetPass actionCode={params.actionCode} continueUrl={params.continueUrl} lang={params.lang} />;
								case 'verifyEmail':
									return <UserConfirmEmail actionCode={params.actionCode} continueUrl={params.continueUrl} lang={params.lang} />;
								case 'recoverEmail':
									return <UserRecoverEmail actionCode={params.actionCode} continueUrl={params.continueUrl} lang={params.lang} />;
								default:
									return <Redirect path={'*'} to={'/error/404'} />;
							}
						}
					}
				}}
			/>

			<Redirect path={'*'} to={'/error/404'} />
		</Switch>
	);
};
