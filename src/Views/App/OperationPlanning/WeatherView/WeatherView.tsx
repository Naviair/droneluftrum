import React from 'react';
import { Antd } from '../../../../Components/Common/Antd';
import './styles.scss';
import { EIconTypes, IconName, Icon } from '@naviair-utm/react-shared-components';
import { capitalizeFirst } from '../../../../Utils/text';
import { IDailyWeather, IWeatherWeek, EWeatherIcon } from '@naviair-utm/node-shared-interfaces';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

interface IWeatherViewProps {
	data?: IWeatherWeek;
	location?: string;
}

const dateConverter = (unixstamp: number) => {
	const [t] = useTranslation('translations');
	const momentTimestamp = moment.unix(unixstamp);
	if (momentTimestamp.isSame(new Date(), 'day')) {
		return t('I dag');
	} else if (momentTimestamp.isSame(moment(new Date()).add(1, 'day'), 'day')) {
		return t('I morgen');
	} else {
		return momentTimestamp.format('DD-MM-YYYY');
	}
};

const WeatherViewItemRow: React.FC<{ icon: IconName; value: string; rotateIcon?: number }> = (props) => {
	return (
		<div className={'row'}>
			<div className={'col right'}>
				<Icon rotate={props.rotateIcon ? props.rotateIcon : 0} name={props.icon} type={EIconTypes.REGULAR} />
			</div>
			<div className={'col value'}>{props.value}</div>
		</div>
	);
};

interface IWeatherViewItemProps {
	weather: IDailyWeather;
}

const WeatherViewItem: React.FC<IWeatherViewItemProps> = (props) => {
	const { weather } = props;
	const [t] = useTranslation('translations');

	return (
		<div className={'weatherColContainer'}>
			<div className={'weatherImage'}>
				<Icon name={EWeatherIcon[weather.weather[0].icon]} type={EIconTypes.REGULAR} />
			</div>
			<div className={'weatherHeader'}>
				<div className={'headerText'}>{dateConverter(weather.dt)}</div>
				<div className={'headerText'}>{capitalizeFirst(t(weather.weather[0].description))}</div>
			</div>
			<div className={'weatherContent'}>
				<WeatherViewItemRow icon={'temperature-up'} value={`${Math.round(weather.temp.max)} \u00b0C`} />
				<WeatherViewItemRow icon={'temperature-down'} value={`${Math.round(weather.temp.min)} \u00b0C`} />
				<WeatherViewItemRow icon={'raindrops'} value={`${weather.rain ? Math.round(weather.rain) : '0'} mm`} />
				<WeatherViewItemRow
					icon={'long-arrow-alt-up'}
					value={`${weather.wind_speed ? Math.round(weather.wind_speed) : '0'} m/s`}
					rotateIcon={weather.wind_deg + 180}
				/>
				<WeatherViewItemRow icon={'wind'} value={`${weather.wind_gust ? Math.round(weather.wind_gust) : '0'} m/s`} />
			</div>
		</div>
	);
};

export const WeatherView: React.FC<IWeatherViewProps> = (props) => {
	const [t] = useTranslation('translations');

	return (
		<div className={'cardWrapper'}>
			<Antd.Card size={'small'} title={`${t('Vejr')}${props.location ? ` - ${props.location}` : ''}`}>
				{props.data && props.data.daily.length > 0 ? (
					<div className={'divScrollableX'}>
						<div className={'weatherRowContainer'}>
							{props.data.daily.map((weather, index) => {
								return <WeatherViewItem weather={weather} key={`weatherItem${index}`} />;
							})}
						</div>
					</div>
				) : (
					<div className={'noDataDiv'}>
						<Antd.Empty
							image={Antd.Empty.PRESENTED_IMAGE_SIMPLE}
							description={<Antd.Typography.Text className={'noDataText'}>{t('Ingen vejrdata for det valgte område')}</Antd.Typography.Text>}
						/>
					</div>
				)}
			</Antd.Card>
		</div>
	);
};
