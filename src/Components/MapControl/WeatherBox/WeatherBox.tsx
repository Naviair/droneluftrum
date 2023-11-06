import { EMonth, EWeatherIcon, ILatLng, IWeather, IWeatherWeek } from '@naviair-utm/node-shared-interfaces';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { EIconTypes, IconName, Skeleton, Icon } from '@naviair-utm/react-shared-components';
import { capitalizeFirst } from '../../../Utils/text';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { useTranslation } from 'react-i18next';
import { getWeatherForecast, getWeatherCurrent } from '../../../Api/backendServices';
import { Antd } from '../../Common';
import { RightOutlined } from '@ant-design/icons';
import './styles.scss';

export interface IWeatherProps {
	show: boolean;
	latlng?: ILatLng;
}

interface IWeatherboxDetail {
	title: string;
	value: string | JSX.Element;
}

const WeatherboxSection: React.FC<IWeatherboxDetail> = (props) => {
	const [t] = useTranslation('translations');
	return (
		<Antd.List.Item.Meta
			avatar={t(props.title)}
			title={
				<div className={'align-right'}>
					<div className={'section'}>
						<div className={'font-weight-1k'}>{props.value}</div>
					</div>
				</div>
			}
		/>
	);
};

export const WeatherBox: React.FC<IWeatherProps> = (props) => {
	const lang = useRecoilValue(Recoil.Language.Atom);
	const [t] = useTranslation('translations');
	const [weatherForecast, setWeatherForecast] = useState<IWeatherWeek>();
	const [weatherCurrent, setWeatherCurrent] = useState<IWeather>();
	const [weatherLoading, setWeatherLoading] = useState(false);

	const dateConverter = (unixstamp: number, lang: string) => {
		const date = new Date(unixstamp * 1000);
		return lang !== 'da-DK' ? `${t(EMonth[date.getMonth()])} ${date.getDate()} ` : `${date.getDate()}. ${t(EMonth[date.getMonth()])}`;
	};

	/* Only fetch forecast info if weatherbox sidepanel is active. */
	useEffect(() => {
		/* If show and location defined, start fetching. */
		setWeatherLoading(true);
		props.show &&
			props.latlng &&
			getWeatherCurrent(props.latlng.lat, props.latlng.long)
				.then((res) => {
					setWeatherCurrent(res);
				})
				.then(() => {
					props.latlng &&
						getWeatherForecast(props.latlng.lat, props.latlng.long)
							.then((res) => {
								setWeatherForecast(res);
							})
							.finally(() => setWeatherLoading(false));
				});
	}, [props.show, props.latlng]);

	interface ICollapseHeader {
		title: string;
		name?: string;
	}

	const CollapseHeader: React.FC<ICollapseHeader> = (props) => (
		<div className={'align-center'}>
			{props.name ? <h2>{props.name}</h2> : ''}
			<h4 className={'collapseheader-title'}>{props.title}</h4>
		</div>
	);

	interface ITitleComponentProps {
		title: string;
		description: string;
		icon: IconName;
	}

	const TitleComponent: React.FC<ITitleComponentProps> = (props) => {
		return (
			<div className={'title-container'}>
				<div className={'weather-container left'}>
					<Icon className={'weather-icon'} name={props.icon && props.icon} type={EIconTypes.REGULAR} />
				</div>
				<div className={'info-container center'}>
					<div className={'font-weight-1k'}>{t(props.title)}</div>
					<div className={'list-description'}>{capitalizeFirst(t(props.description))}</div>
				</div>
			</div>
		);
	};

	return weatherCurrent ? (
		<>
			<CollapseHeader name={weatherCurrent.name} title={t('Vejrudsigt')} />
			{weatherForecast && !weatherLoading ? (
				<>
					<Antd.Divider />
					<Antd.Collapse
						key={'collapse_weather_now'}
						className={'custom-collapse'}
						defaultActiveKey={['panel_current']}
						bordered={false}
						expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
						expandIconPosition={'right'}>
						<Antd.Panel
							className={'custom-panel'}
							key={'panel_current'}
							header={
								<Antd.List.Item key={'header_item_current'}>
									<Antd.List.Item.Meta
										title={
											<TitleComponent
												title={'Lige nu'}
												description={weatherCurrent.weather[0].description}
												icon={EWeatherIcon[weatherCurrent.weather[0].icon]}
											/>
										}
									/>
								</Antd.List.Item>
							}>
							<WeatherboxSection title={'Temperatur'} value={`${Number(weatherCurrent.main.temp).toFixed(0)} \u00b0C`} /> <br />
							<WeatherboxSection title={'Vind'} value={`${weatherCurrent.wind.speed} m/s`} /> <br />
							<WeatherboxSection
								title={'Vindretning'}
								value={<Icon rotate={weatherCurrent.wind.deg + 180} className={'wind-icon'} name={'long-arrow-alt-up'} type={EIconTypes.REGULAR} />}
							/>
							<br />
							<WeatherboxSection title={'Luftfugtighed'} value={`${weatherCurrent.main.humidity} %`} /> <br />
							<WeatherboxSection title={'Lufttryk'} value={`${weatherCurrent.main.pressure} hPa`} /> <br />
							<WeatherboxSection title={'Sigtbarhed'} value={`${weatherCurrent.visibility} m`} /> <br />
							<WeatherboxSection title={'Solopgang'} value={`${moment.unix(weatherCurrent.sys.sunrise).format('HH:mm')}`} /> <br />
							<WeatherboxSection title={'Solnedgang'} value={`${moment.unix(weatherCurrent.sys.sunset).format('HH:mm')}`} />
						</Antd.Panel>
					</Antd.Collapse>
					<Antd.Divider />

					{/* FORECAST: Wait for fetch*/}
					<CollapseHeader title={t('Kommende dage')} />
					<Antd.Collapse
						accordion
						key={'collape_weather_forecast'}
						className={'custom-collapse'}
						bordered={false}
						expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
						expandIconPosition={'right'}>
						{weatherForecast.daily.map((daily, index) => (
							<Antd.Panel
								className={'custom-panel'}
								key={`panel_${index}`}
								header={
									<Antd.List.Item key={`header_item_${index}`}>
										<Antd.List.Item.Meta
											title={
												<TitleComponent
													icon={EWeatherIcon[daily.weather[0].icon]}
													title={index === 0 ? t('I dag') : index === 1 ? t('I morgen') : dateConverter(daily.dt, lang)}
													description={daily.weather[0].description}
												/>
											}
										/>
									</Antd.List.Item>
								}>
								<Antd.List.Item key={index}>
									<WeatherboxSection title={'Temperatur'} value={`${Number(daily.temp.day).toFixed(0)} \u00b0C`} /> <br />
									<WeatherboxSection title={'Vind'} value={`${daily.wind_speed} m/s`} /> <br />
									<WeatherboxSection title={'Vindstød'} value={`${daily.wind_gust ? Math.round(daily.wind_gust) : '0'} m/s`} /> <br />
									<WeatherboxSection
										title={'Vindretning'}
										value={<Icon className={'wind-icon'} rotate={daily.wind_deg + 180} name={'long-arrow-alt-up'} type={EIconTypes.REGULAR} />}
									/>
									<br />
									<WeatherboxSection title={'Regn'} value={`${daily.rain ? Math.round(daily.rain) : '0'} mm`} /> <br />
									<WeatherboxSection title={'Luftfugtighed'} value={`${daily.humidity} %`} /> <br />
									<WeatherboxSection title={'Lufttryk'} value={`${daily.pressure} hPa`} /> <br />
									<WeatherboxSection title={'Solopgang'} value={`${moment.unix(daily.sunrise).format('HH:mm')}`} /> <br />
									<WeatherboxSection title={'Solnedgang'} value={`${moment.unix(daily.sunset).format('HH:mm')}`} />
								</Antd.List.Item>
							</Antd.Panel>
						))}
					</Antd.Collapse>
				</>
			) : (
				<Skeleton speed={0.7} backgroundColor={'#f9f9f9'} foregroundColor={'#96ae09'} lines={[{ leftMarg: '0', topMarg: '10', width: '250', height: '1' }]} />
			)}
		</>
	) : (
		<>
			<h2>{t('Vejret')}</h2>
			<div className={'weather_box'}>{t('Ingen vejrinformationer fundet for pågældende lokalitet!')}</div>
		</>
	);
};
