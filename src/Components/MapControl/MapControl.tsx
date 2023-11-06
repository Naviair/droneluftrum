import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {
	addMarker,
	getClickableLayers,
	IMap,
	IMapSettings,
	initializeMap,
	addNotam,
	mapScreenResponsive,
	mapFlyToPostition,
	handle3DTerrainLayer,
} from './mapControlHelper';
import { SettingsPanel } from './SettingsPanel/SettingsPanel';
import { InfoBox } from './InfoBox/InfoBox';
import './styles.scss';
import { SidePanel } from './SidePanel/SidePanel';
import { WeatherBox } from './WeatherBox/WeatherBox';
import { Antd } from '../Common';
import { Recoil, useRecoilState, useRecoilValue, useSetRecoilState } from '../../Recoil';
import { Document } from '../Document/Document';
import { IGeo, ILatLng } from '@naviair-utm/node-shared-interfaces';
import { EIconTypes, useWindowDimensions, Icon } from '@naviair-utm/react-shared-components';
import { useTranslation } from 'react-i18next';
import { CookieHandler, ECookies } from '../../Utils/CookieHandler';
import { getZones } from '../../Api';
import { message } from 'antd';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons/faMapMarkerAlt';
import { faTimes } from '@fortawesome/pro-light-svg-icons/faTimes';
import moment from 'moment';
const { getCookie, getAcceptedCookies } = CookieHandler();

type TMarkerAddedEvent = {
	geoInfo?: IGeo;
	features?: mapboxgl.MapboxGeoJSONFeature[];
	latLng?: ILatLng;
	showInfo?: boolean;
	infoboxState?: boolean;
};

interface IMapControlResponse {
	renderMapControl: JSX.Element;
	getMapState: IMap | undefined;
	getMapOnReadyState: boolean;
}

/* 
	Add dummy layers for ordering notams and drawn areas
	By adding these two empty layers and placing z-index-1 below z-index-2 (see comment in the code below),
	we can use these two as references for notams and user-drawn layers by placing the notams below z-index-1
	and the user-drawn layers below z-index-2 (but therefore still above z-index-1). We have this stack: 
	z-index-2
		user-drawn-2
		user-drawn-1
	z-index-1
		notam-3
		notam-2
		notam-1
	This way, we make sure that the user can see their drawn areas and the labels are not below a notam.
*/
export const addZLayers = (map: mapboxgl.Map) => {
	const zLayer2 = map.getLayer('z-index-2');

	if (!map.getSource('empty')) {
		map.addSource('empty', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] },
		});
	}

	if (typeof zLayer2 === 'undefined') {
		// Z-index 2
		map.addLayer({
			id: 'z-index-2',
			type: 'symbol',
			source: 'empty',
		});
	}

	const zLayer1 = map.getLayer('z-index-1');

	// If z-index-1 does not exist, byt z-layer-2 DOES exist (necessary for this to work), add z-index-1
	if (typeof zLayer1 === 'undefined' && typeof zLayer2 !== 'undefined') {
		// Z-index 1
		map.addLayer(
			{
				id: 'z-index-1',
				type: 'symbol',
				source: 'empty',
			},
			'z-index-2' // This part is important and puts this layer below z-index-2
		);
	}
};

export const MapControl = (props: IMapSettings): IMapControlResponse => {
	const mapContainer = useRef<HTMLDivElement>(null);
	const [getActiveSidePanel, setActiveSidePanel] = useState<string>();
	const [getOnReadyState, setOnReadyState] = useState<boolean>(false);
	//const [getLocationInfoState, setLocationInfoState] = useState<IInfoBoxProps>({ locationInfo: {}, show: false });
	const [zonesDownloading, setZonesDownloading] = useState(false);

	//Recoil States
	const setLayerRState = useSetRecoilState(Recoil.MapLayerGroup.Selector);
	const setBackgroundRState = useSetRecoilState(Recoil.MapBackground.Selector);
	const setGLoadingRState = useSetRecoilState(Recoil.GeneralLoading.Atom);

	//Recoil Values
	const getMapSearchClickRState = useRecoilValue(Recoil.MapSearchClick.Atom);
	const screenLandscapeS = useRecoilValue(Recoil.ScreenLandscape.Atom);
	const getNotamRState = useRecoilValue(Recoil.Notam.Atom);
	const getActiveLanguageState = useRecoilValue(Recoil.Language.Atom);

	/* For current information about selected geo-place */
	const [getMapState, setMapState] = useState<IMap>();
	const [markerStates, setMarkerStates] = useState<{
		geoState?: IGeo;
		latLngState?: ILatLng;
		featureState?: mapboxgl.MapboxGeoJSONFeature[];
		infoboxState: boolean;
	}>({ infoboxState: false });

	const geoInfo = markerStates.geoState;
	const address = geoInfo?.address?.place_name ? geoInfo.address.place_name : ' - ';
	const addressDistance = geoInfo?.distance ? `${geoInfo.distance}m` : ' - ';
	const [t] = useTranslation('translations');
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const [getTerrainState, setTerrainState] = useRecoilState(Recoil.MapTerrain.Selector);
	const getHeight = () => {
		if (geoInfo?.dsm && geoInfo.dtm) {
			const dsm = geoInfo.dsm !== -9999 ? `${Number(geoInfo.dsm - geoInfo.dtm).toFixed(2)}m` : undefined;
			const dtm = geoInfo.dtm !== -9999 ? `${Number(geoInfo.dtm).toFixed(2)}m` : undefined;
			return { dsm, dtm };
		}
	};
	const height = getHeight();

	//MAPBOX API TOKEN//
	mapboxgl.accessToken = props.settings.mapbox.apiKey;

	const downloadZones = () => {
		setZonesDownloading(true);
		getZones()
			.then((result) => {
				/* Download blob */
				const downloadDate = new Date();
				const element = document.createElement('a');
				const geozones = new Blob([JSON.stringify(result)]); //pass data from localStorage API to blob
				element.href = URL.createObjectURL(geozones);
				element.setAttribute('download', `zones_${moment(downloadDate).format('DDMMYYYY')}.geojson`);
				element.click();
			})
			.catch(() => {
				message.error(t('Der gik noget galt, ved download af zoner. Prøv igen.'));
			})
			.finally(() => setZonesDownloading(false));
	};

	//Set geoInfo on load
	const handleDataFetch = async () => {
		setMarkerStates({ geoState: geoInfo, infoboxState: false });
	};

	//Listen for search change in state
	useEffect(() => {
		const { lat, long } = getMapSearchClickRState;
		const { tilesets } = props.settings.map;
		const layersArr: string[] = getClickableLayers(tilesets);
		if (lat && long && getMapState) {
			mapFlyToPostition(getMapState.mapComponent, { lat: lat, long: long }, 16);
			getMapState.mapComponent.once('moveend', () => {
				addMarker(getMapState.mapComponent, { lat: lat, long: long }, layersArr, props.lang);
			});
		}
	}, [getMapSearchClickRState]);

	useEffect(() => {
		mapScreenResponsive(screenLandscapeS, mapContainer);
	});

	//ComponentDidMount
	useEffect(() => {
		if (mapContainer.current) {
			setGLoadingRState(true);
			//Initialize map with map settings
			initializeMap(mapContainer.current, props).then((map) => {
				//Set default locationInfo
				handleDataFetch();

				//Set the map to state so it can be set in props on SettingsPanel
				setMapState(map);
				setOnReadyState(true);
				//Settings state to show settings
				map.mapComponent.on('showSidePanel', (evt) => setActiveSidePanel(evt.status ? evt.component : undefined));

				//Check for 3D terrain on data load
				map.mapComponent.once('data', () => {
					const cookies = getAcceptedCookies();
					const cookieTerrainSettings: boolean = getCookie(ECookies.TERRAIN_SETTINGS);

					//set local terrain state based on cookie (if exists)
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (cookies.functionality && cookieTerrainSettings !== undefined) {
						setTerrainState(cookieTerrainSettings);
					}

					//Update map terrain on terrain state
					handle3DTerrainLayer(map.mapComponent, getTerrainState);
				});
				//Set state and call changeLayer function
				map.mapComponent.on('changeLayer', (evt) => {
					addZLayers(map.mapComponent);
					setLayerRState(evt.layer);
					map.setLayer(evt.layer);
				});
				//Set state and call setBackground function
				map.mapComponent.on('changeBackground', (evt) => {
					addZLayers(map.mapComponent);
					setBackgroundRState(evt.background);
					map.setBackground(evt.background);
				});
				map.mapComponent.once('idle', () => {
					setTimeout(() => {
						map.mapComponent.resize();
						setGLoadingRState(false); //TODO - Currently extends load until map is resized to container. Can maybe be optimized.
					}, 100);

					// If enabled go to userlocation (triggers GeolocateControl and sets geoInfo to new position)
					props.goToUserLocationOnLoad &&
						props.controls?.forEach((control) => {
							control.controlType.forEach((controlType) => {
								const activeControlPlacement = screenLandscapeS ? 'top-left' : 'bottom-right';
								if (controlType instanceof mapboxgl.GeolocateControl && control.placement === activeControlPlacement) {
									controlType.trigger();
									controlType.once('geolocate', (data) => {
										const position = data as GeolocationPosition;
										if (position) {
											handleDataFetch();
										}
									});
								}
							});
						});
				});

				/* Show infobox everytime we click. Help indicate that we are retrieving information by showing loader. */
				map.mapComponent.on('click', () => {
					setMarkerStates({ infoboxState: true });
				});

				map.mapComponent.on('markerAdded', (evt: TMarkerAddedEvent) => {
					setMarkerStates({
						geoState: evt.geoInfo,
						featureState: evt.features,
						latLngState: evt.latLng,
						infoboxState: evt.infoboxState !== undefined ? evt.infoboxState : true,
					});
				});
				// Add dummy layers on creation
				addZLayers(map.mapComponent);
				// Add notams that are ordered with the dummy layers
				addNotam(map.mapComponent, getNotamRState);
			});

			return function cleanUp() {
				mapContainer.current?.remove();
			};
		}
	}, []);

	// Resize map when language or window height changed
	// Use the useWindowDimensions hook and re-render the map on change
	const { height: windowHeight } = useWindowDimensions();
	useEffect(() => {
		setTimeout(() => {
			getMapState?.mapComponent.resize();
		}, 1000);
	}, [getActiveLanguageState, windowHeight]);

	//Used to set layer on change of background or layer
	useEffect(() => {
		getMapState?.mapComponent.once('styledata', () => {
			addZLayers(getMapState.mapComponent);
			getMapState.addLayers(props.defaultLayer);
			getMapState.setLayer(props.defaultLayer);
			handle3DTerrainLayer(getMapState.mapComponent, getTerrainState);
			addNotam(getMapState.mapComponent, getNotamRState);
		});
	}, [props.defaultLayer, props.defaultBackground]);

	//Checks 3D Terrain on state change
	useEffect(() => {
		if (getMapState?.mapComponent) {
			handle3DTerrainLayer(getMapState.mapComponent, getTerrainState);
		}
	}, [getTerrainState]);

	useEffect(() => {
		if (getMapState) {
			addZLayers(getMapState.mapComponent);
			addNotam(getMapState.mapComponent, getNotamRState);
		}
	}, [getNotamRState]);

	//Move controls with sidePanel
	useEffect(() => {
		const elements = document.querySelectorAll('.mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right');

		for (const element of elements) {
			if (getActiveSidePanel) {
				element.classList.add('settings_visible');
			} else {
				element.classList.remove('settings_visible');
			}
		}
	}, [getActiveSidePanel]);

	const renderMapControl = (
		<>
			<div className={'map'}>
				<div className={'mapContainer'} ref={mapContainer}></div>

				<SidePanel visible={getActiveSidePanel === 'safety'}>
					<Document {...configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].disclaimer]} />
				</SidePanel>
				<SidePanel visible={getActiveSidePanel === 'download'}>
					<Document {...configuration.documents[configuration.settings.app.documents[useRecoilValue(Recoil.Language.Atom)].download]}>
						<div className={'downloadButtonDiv'}>
							<Antd.Button type={'primary'} loading={zonesDownloading} onClick={() => downloadZones()}>
								<span className={'downloadText'}>{'Download'}</span> <Icon name={'download'} type={EIconTypes.SOLID} />
							</Antd.Button>
						</div>
					</Document>
				</SidePanel>
				<SidePanel visible={getActiveSidePanel === 'weather'}>
					<WeatherBox show={getActiveSidePanel === 'weather'} latlng={markerStates.latLngState} />
				</SidePanel>
				<SettingsPanel
					mapLayers={props.settings.map.layers}
					mapTypes={props.settings.map.types}
					map={getMapState?.mapComponent}
					visible={getActiveSidePanel === 'settings'}
				/>
			</div>
			{props.withInfoBox && (
				<InfoBox
					features={markerStates.featureState}
					show={markerStates.infoboxState}
					geoInfo={markerStates.geoState}
					latLng={markerStates.latLngState}
					onClose={() => setMarkerStates({ infoboxState: false })}
					headerContent={
						<div className={'info_header'}>
							<div className={'icon'}>
								<Icon name={'map-marker-alt'} icon={faMapMarkerAlt} type={EIconTypes.SOLID} />
							</div>
							<div className={'position'}>
								<div>
									<span className={'label'}>
										{'Lat: '}
										<span className={'value'}>{Number(markerStates.latLngState?.lat).toFixed(6)}</span>
									</span>
									<span className={'label'}>
										{'Long: '}
										<span className={'value'}>{Number(markerStates.latLngState?.long).toFixed(6)}</span>
									</span>
								</div>
								<div className={'address'}>
									<span className={'label'}>
										{t('Adresse')}
										{': '}
										<span className={'value'}>{address}</span>
									</span>
								</div>
								<div>
									<span className={'label'}>
										{t('Afstand til adresse')}
										{': '}
										<span className={'value'}>{addressDistance}</span>
									</span>
								</div>
								<div>
									{height?.dsm ? (
										<span className={'label'}>
											{t('Hindringshøjde')}
											{': '}
											<span className={'value'}>{height.dsm}</span>
										</span>
									) : (
										<span></span>
									)}
								</div>
								<div>
									{height?.dtm ? (
										<span className={'label'}>
											{t('Terrænhøjde')}
											{': '}
											<span className={'value'}>{height.dtm}</span>
										</span>
									) : (
										<span></span>
									)}
								</div>
							</div>
							<div onClick={() => setMarkerStates({ infoboxState: false })} className={'close'}>
								<Icon name={'times'} icon={faTimes} type={EIconTypes.LIGHT} />
							</div>
						</div>
					}
				/>
			)}
		</>
	);
	return {
		renderMapControl,
		getMapState,
		getMapOnReadyState: getOnReadyState,
	};
};
