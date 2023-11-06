import './styles.scss';
import React from 'react';
import { EIconTypes, Icon } from '@naviair-utm/react-shared-components';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';
import { Recoil, useRecoilValue } from '../../Recoil';
import { faTools } from '@fortawesome/pro-solid-svg-icons/faTools';

/**
 * Props for the Maintenance component
 */
interface IMaintenanceProps {
	/**Main title to display. Required.*/
	title: string;
	/** Any extra text to display below the title. Part into array for new sections. Optional. */
	subtitle?: string | string[];
}

/**
 * ## Maintenance page implementation
 *
 * @example <Maintenance
 * title={"Maintenance underway"}
 * subtitle={["Planned maintenance 16-03-2021", "Last update 10:55am"]} />
 *
 * @param props See {@link MaintenanceProps}
 *
 * @returns The maintenance page
 */
export const Maintenance: React.FC<IMaintenanceProps> = (props) => {
	/**
	 * If not already, sets props.subtitles to an array and maps it to <p> elements.
	 *
	 * @param subtitles Subtitles to include below the tools icon.
	 * @returns the mapped subtitles as <p> elements
	 */
	const handleSubtitles = (subtitles: string | string[]) => {
		if (!Array.isArray(subtitles)) subtitles = [subtitles];
		return subtitles.map((text, index) => (
			<p key={`${'subtitle'}-${index}`} className={'subtitle'}>
				{text}
			</p>
		));
	};

	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);

	return (
		<div className={'maintenance'}>
			<div className={`maintenance_content${screenTypeS === EScreenType.MOBILE ? '_mobile' : ''}`}>
				<h1>{props.title}</h1>
				<div className={'icon_wrapper'}>
					<div className={'icon'}>
						<Icon name={'tools'} icon={faTools} type={EIconTypes.SOLID} />
					</div>
				</div>
				{props.subtitle && handleSubtitles(props.subtitle)}
				{props.children}
			</div>
		</div>
	);
};
