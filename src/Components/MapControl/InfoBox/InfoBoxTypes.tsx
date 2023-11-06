import { MapboxGeoJSONFeature } from 'mapbox-gl';
import { ITileExt, TSettingsMapLayer } from '@naviair-utm/node-shared-interfaces';

export type TLayerProperties = {
	height?: number;
	type?: string;
	name?: string;
};

export interface ILayerNotam {
	name: string;
	description?: string;
	type: 'notam-active' | 'notam-awareness' | 'notam-disabled' | 'notam-inactive' | string;
	notams: string;
}

export interface ILayer {
	key: string;
	type: 'layer' | 'notam';
	properties: ITileExt | ILayerNotam;
	color?: string;
}
const notamColors: { [key: string]: { color: string; fill: boolean } } = {
	'notam-active': { color: '211,94,96', fill: true },
	'notam-inactive': { color: '255,204,0', fill: true },
	'notam-awareness': { color: '225,151,76', fill: true },
	'notam-disabled': { color: '0,0,0', fill: false },
};

export const parseFeatures = async (features: MapboxGeoJSONFeature[] | undefined, curLayer: TSettingsMapLayer): Promise<ILayer[] | undefined> => {
	return new Promise((resolve) => {
		if (features) {
			let layerArr: ILayer[] = [];
			Promise.all(
				features.map((feature) => {
					return new Promise((resolve) => {
						if (feature.source.includes('notam')) {
							const layerProps = feature.properties as ILayerNotam;
							layerProps.type = feature.source;
							resolve(
								layerArr.push({
									key: layerProps.name,
									type: 'notam',
									properties: layerProps,
									color: notamColors[feature.source].color,
								})
							);
						} else {
							const layerId = feature.properties?.id;
							if (layerId) {
								const layerProps = feature.properties as ITileExt;
								const curColor = curLayer.tilesetGroups.find((value) => value.tilesets.some((tile) => tile.id.includes(layerProps.typeId)))?.color;

								resolve(
									layerArr.push({
										key: layerId,
										type: 'layer',
										properties: layerProps,
										color: curColor,
									})
								);
							} else {
								resolve(layerArr);
							}
						}
					});
				})
			).then(() => {
				layerArr = layerArr.sort((a, b) => {
					if (a.type === 'notam') {
						return 0;
					} else {
						const propA = a.properties as ITileExt;
						const propB = b.properties as ITileExt;
						return propA.typeId.localeCompare(propB.typeId);
					}
				});
				resolve(layerArr);
			});
		}
	});
};
