import { IDocument, IDocumentCollapse, IDocumentHtml, IDocumentTable, TDocumentTableRow } from '@naviair-utm/node-shared-interfaces';
import { Antd } from '../Common';
import moment from 'moment-timezone';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import './styles.scss';

const DocumentTable: React.FC<IDocumentTable> = (props) => {
	const cols = props.columns.map((col) => {
		return { title: col.title, dataIndex: col.index };
	});
	const rows = props.rows;

	return (
		<div className={'document_table'}>
			{props.title && <div className={'title'}>{props.title}</div>}
			<Antd.Table<TDocumentTableRow> scroll={{ x: true }} columns={cols} dataSource={rows} rowKey={() => `row_${props.title}_${uuid()}`} pagination={false} />
		</div>
	);
};

export const DocumentHtml: React.FC<IDocumentHtml> = (props) => {
	return (
		<div
			className={'document_html'}
			dangerouslySetInnerHTML={{
				__html: props.data,
			}}
		/>
	);
};

const DocumentCollapse: React.FC<IDocumentCollapse> = (props) => {
	return (
		<div className={'document_collapse'}>
			<Antd.Collapse expandIconPosition={'right'} accordion>
				{props.data.map((entry, index) => {
					return (
						<Antd.Panel header={entry.title} key={`collapse_${index}`}>
							<div
								dangerouslySetInnerHTML={{
									__html: entry.details,
								}}
							/>
						</Antd.Panel>
					);
				})}
			</Antd.Collapse>
		</div>
	);
};

export const Document: React.FC<IDocument> = (props) => {
	const [t] = useTranslation('translations');
	const doc = props;
	return (
		<>
			{doc.content.map(({ html, table, collapse }, index) => {
				if (html) {
					return <DocumentHtml key={`section_${index}`} {...html} />;
				} else if (table) {
					return <DocumentTable key={`section_${index}`} {...table} />;
				} else if (collapse) {
					return <DocumentCollapse key={`section_${index}`} {...collapse} />;
				}
			})}
			{props.children}
			<div className={'document_date'}>
				{t('Senest opdateret den')} {moment.unix(doc.lastUpdated).format('DD.MM.YYYY zz')}
			</div>
		</>
	);
};
