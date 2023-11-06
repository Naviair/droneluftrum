import React from 'react';
import { IDocument } from '@naviair-utm/node-shared-interfaces';
import { Card, SingleLayout } from '@naviair-utm/react-shared-components';
import { Document } from '../../../Components/Document/Document';
import { useTranslation } from 'react-i18next';
interface IDocumentView {
	document: IDocument;
}

export const DocumentView: React.FC<IDocumentView> = (props) => {
	const doc = props.document;
	const [t] = useTranslation('translations');
	return (
		<SingleLayout>
			<Card key={`informationCardDocument_${1}`} fill title={t(doc.title)} icon={doc.icon}>
				<Document {...doc} />
			</Card>
		</SingleLayout>
	);
};
