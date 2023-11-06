import { IPage } from '@naviair-utm/node-shared-interfaces';
import React, { useEffect } from 'react';
import { Card, ContentLayout } from '@naviair-utm/react-shared-components';
import { Document } from '../../../Components/Document/Document';
import { Recoil, useRecoilValue, useSetRecoilState } from '../../../Recoil';
import { useTranslation } from 'react-i18next';

interface IPageViewProps {
	page: IPage;
}

export const PageView: React.FC<IPageViewProps> = (props) => {
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const [t] = useTranslation('translations');
	const documents = configuration.documents;
	const setGLoadingRState = useSetRecoilState(Recoil.GeneralLoading.Atom);

	useEffect(() => {
		setGLoadingRState(false);
	}, []);

	const page = props.page;
	return (
		<ContentLayout title={t(page.name)} multipage>
			{page.data.map((section, index) => {
				const doc = documents[section.documentId];
				return (
					<Card type={'small'} key={`sectionCard_${index}`} fill title={section.title} icon={section.icon}>
						<Document {...doc} />
					</Card>
				);
			})}
		</ContentLayout>
	);
};
