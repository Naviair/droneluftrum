import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mbxGeocoder, { GeocodeFeature, GeocodeRequest, GeocodeResponse } from '@mapbox/mapbox-sdk/services/geocoding';
import { ILatLng } from '../../../Interfaces/generel';
const mbxClient = require('@mapbox/mapbox-sdk');

/**
 * TODO: accesToken should be taken from configuration
 */
const baseClient = mbxClient({ accessToken: 'pk.eyJ1Ijoia2pvLW5hdmlhaXIiLCJhIjoiY2sweG14M3U5MDVzYjNjbnpqZjllY2FvNyJ9.EtllT6fSJmzyZ3qFFStbCw' });
const geocoderService = mbxGeocoder(baseClient);

/**
 * Listener for current geo-location.
 */
export const watchGeoLocation = async (geoLocationListener: (status: boolean, position?: ILatLng, message?: string) => void): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			//Watch position for callback function in input function
			try {
				navigator.geolocation.watchPosition(
					(position) => {
						geoLocationListener(true, { lat: position.coords.latitude, long: position.coords.longitude });
					},
					(error) => {
						geoLocationListener(false, undefined, error.message);
					}
				);
				resolve();
			} catch (error) {
				reject(error);
			}
		} else {
			reject('GPS DISABLED');
		}
	});
};

/**
 * Get current geo-location
 */
export const getGeoLocation = async (): Promise<ILatLng> => {
	return new Promise((resolve, reject) => {
		try {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						resolve({ lat: position.coords.latitude, long: position.coords.longitude });
					},
					(error) => {
						reject(error.message);
					},
					{
						timeout: 5000,
					}
				);
				setTimeout(() => {
					reject('Timeout');
				}, 6000);
			} else {
				reject('GPS DISABLED');
			}
		} catch (err) {
			reject(err);
		}
	});
};

/**
 * Fly to given position.
 * @param center         |      Define map focus (latitude, longitude)
 * @param zoom           |      Zoom grade for current docus
 * @param map            |      The targeted map component
 */
export const mapFlyToPostition = (map: mapboxgl.Map, latLng: ILatLng, zoom: number): void => {
	map.flyTo({
		center: [latLng.long, latLng.lat],
		zoom: zoom,
		essential: true,
	});
};

/**
 * Lookup locations in searchbar. Will be called for every detected chance to input string.
 */
export const geoCodingLookup = (searchInput: string, countries: string[], limit = 5): Promise<GeocodeFeature[]> => {
	return new Promise((resolve, reject) => {
		try {
			const request: GeocodeRequest = {
				query: searchInput,
				mode: 'mapbox.places',
				countries: countries,
				language: ['da-DK'],
				limit,
				//limit: 5
				/**
				 * TODO: Implement languages
				 */
				//language: this.props.geoLanguages,
			};
			geocoderService
				.forwardGeocode(request)
				.send()
				.then((response) => {
					const match: GeocodeResponse = response.body;
					const features: GeocodeFeature[] = match.features;
					resolve(features);
				});
		} catch (error) {
			reject(error);
		}
	});
};
