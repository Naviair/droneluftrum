import { GeocodeFeature } from '@mapbox/mapbox-sdk/services/geocoding';
import React, { useState } from 'react';
import { Recoil, useRecoilValue, useSetRecoilState } from '../../../Recoil';
import { useTranslation } from 'react-i18next';
import { IConfiguration, EScreenType } from '@naviair-utm/node-shared-interfaces';
import { geoCodingLookup } from '../mapControlHelper';
import { Search, ISuggests } from '@naviair-utm/react-shared-components';

interface IGeoSearch {
	configuration: IConfiguration;
}

export const GeoSearch: React.FC<IGeoSearch> = (props) => {
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	const [getGeoResultState, setGeoResultState] = useState<ISuggests[]>();
	const [getGeoRawResultState, setGeoRawResultState] = useState<GeocodeFeature[]>();
	const setMapSearchClickRState = useSetRecoilState(Recoil.MapSearchClick.Atom);
	const [t] = useTranslation('translations');

	const handleResultClick = (key?: string) => {
		const result = getGeoRawResultState?.find((value) => value.id === key);
		setMapSearchClickRState({ lat: result?.center[1], long: result?.center[0] });
		setGeoResultState(undefined); //clear suggest list
	};

	const handleOnChange = (input?: string) => {
		if (input && input.length > 0) {
			geoCodingLookup(input, props.configuration.settings.mapbox.searchCountries, screenTypeS === EScreenType.MOBILE ? 3 : 5).then((features) => {
				setGeoRawResultState(features);
				parseResult(features);
			});
		} else {
			setGeoResultState([]);
		}
	};

	const parseResult = async (results: GeocodeFeature[]) => {
		const parsedResults: ISuggests[] = results.map((item) => {
			const tags: string[] = item.place_type.map((tag: string) => {
				return t(tag);
			});
			return { key: item.id, title: item.text, description: item.place_name, tags: tags };
		});
		setGeoResultState(parsedResults);
	};

	return (
		<>
			<>
				<Search
					key={'search-input'}
					placeholder={'Søg adresse'}
					suggests={getGeoResultState}
					onResultClick={handleResultClick}
					mobile={screenTypeS === EScreenType.MOBILE}
					onChange={handleOnChange}
				/>
			</>
		</>
	);
};
