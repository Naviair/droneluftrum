import React, { useEffect } from 'react';
import { Card, ContentLayout } from '@naviair-utm/react-shared-components';
import { capitalizeFirst } from '../../../Utils/text';
import { Recoil, useSetRecoilState } from '../../../Recoil';
import { Redirect, RouteComponentProps, Switch } from 'react-router-dom';
import { ApmRoute } from '@elastic/apm-rum-react';
import { useTranslation } from 'react-i18next';
import { ListEquipment, ListOperation } from './';

export const ListView: React.FC<RouteComponentProps> = (props) => {
	const setGLoadingRState = useSetRecoilState(Recoil.GeneralLoading.Atom);
	const [t] = useTranslation('translations');

	const routeTranslations: { [key: string]: string } = {
		equipment: t('Udstyr'),
		operation: t('Operationsplan'),
	};

	useEffect(() => {
		setGLoadingRState(false);
	}, []);

	/**
	 * TODO: temp solution
	 */
	const page = props.location.pathname.split('/')[3];

	const generateTitle = (title: string) => {
		try {
			return capitalizeFirst(routeTranslations[title]);
		} catch {
			return '';
		}
	};

	return (
		<ContentLayout title={generateTitle(page)} multipage>
			<Card fill>
				<Switch>
					<ApmRoute strict exact path={`${props.match.url}/equipment`} component={() => <ListEquipment pageName={routeTranslations[page]} />} />
					<ApmRoute strict exact path={`${props.match.url}/operation`} component={() => <ListOperation pageName={routeTranslations[page]} />} />
					<Redirect path={'*'} to={'/error/404'} />
				</Switch>
			</Card>
		</ContentLayout>
	);
};
