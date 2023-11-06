import React from 'react';
import { Antd } from '../../Common';
import { Recoil, useRecoilValue, useRecoilState } from '../../../Recoil';
import { EScreenType, TSettingsMapLayer, TSettingsMapType } from '@naviair-utm/node-shared-interfaces';
import { SidePanel } from '../SidePanel/SidePanel';
import { AssetsManager, EAssetsType } from '../../../Utils/AssetsManager';
import { useTranslation } from 'react-i18next';
import { Switch } from '../../Common/Switch';
import { Document } from '../../Document';
import { RightOutlined } from '@ant-design/icons';
import { Icon } from '@naviair-utm/react-shared-components';
import { Tooltip } from 'antd';
import { SwitchClickEventHandler } from 'antd/lib/switch';
import { faTimes } from '@fortawesome/pro-solid-svg-icons/faTimes';
import './styles.scss';

interface IMapSettingsBackgroundListProps {
	mapTypes: TSettingsMapType[];
	onChange: (activeBackground: number) => void;
}

const MapSettingsBackgroundList: React.FC<IMapSettingsBackgroundListProps> = (props) => {
	const [t] = useTranslation('translations');
	const getBackgroundRAState = useRecoilValue(Recoil.MapBackground.Atom);
	return (
		<Antd.Select className={'select'} defaultValue={String(getBackgroundRAState)} onChange={(activeBackground) => props.onChange(Number(activeBackground))}>
			{props.mapTypes.map((type) => (
				<Antd.Select.Option className={'map_settings_panel_background_option'} value={type.index} key={type.index}>
					<AssetsManager path={`map/types/${type.url}.png`} type={EAssetsType.IMG} className={'map_settings_panel_background_option_image'} />
					<span className={'map_settings_panel_background_option_title'}>{t(type.translation)}</span>
				</Antd.Select.Option>
			))}
		</Antd.Select>
	);
};

interface IMapSettingsLayerListProps {
	mapLayers: TSettingsMapLayer[];
	map: mapboxgl.Map | undefined;
}

const MapSettingsLayerList: React.FC<IMapSettingsLayerListProps> = (props) => {
	const getLayerRAState = useRecoilValue(Recoil.MapLayerGroup.Atom);
	const curLayerGroups = props.mapLayers[getLayerRAState].tilesetGroups;
	const [t] = useTranslation('translations');
	const getLanguageRState = useRecoilValue(Recoil.Language.Atom);
	const configuration = useRecoilValue(Recoil.Configuration.Selector);
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);
	const [getLayerState, setLayerState] = useRecoilState(Recoil.mapLayers.Selector);

	const LayerIcon = (props: { border: string; fill: boolean; color: string; iconType: 'circle' | 'line' }) => {
		return (
			<div
				className={props.iconType === 'line' ? 'zoneIconLine' : 'zoneIconCircle'}
				// eslint-disable-next-line react/forbid-dom-props
				style={{
					border: `2px ${props.border ? props.border : 'solid'} rgba(${props.color},1)`,
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
					backgroundColor: `rgba(${props.color},${props.fill === false ? '.0' : '0.6'})`,
				}}
			/>
		);
	};

	/**
	 * Toggles layer visibility as the switch is toggled
	 * @param checked Switch state, toggled or not
	 * @param evt Event state of click used to target the item
	 */
	const toggleLayerSwitch: SwitchClickEventHandler = (checked: boolean, evt: MouseEvent): void => {
		const id = (evt.currentTarget as HTMLButtonElement).id; //this id is from configuration, i.e. "nature"
		setLayerState({ [id]: { toggled: checked } });

		//Set layer invisible
		//@ts-expect-error layers may be undefined
		const fullLayerId = props.map.getStyle().layers.find((layer) => layer.id.includes(`prd-${id}`)).id;
		fullLayerId && props.map?.setLayoutProperty(fullLayerId, 'visibility', checked ? 'visible' : 'none');
	};

	return (
		<Antd.Collapse
			accordion
			className={'custom-collapse'}
			bordered={false}
			expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
			expandIconPosition={'right'}>
			{curLayerGroups.map((item, index) => (
				<Antd.Panel
					className={'custom-panel'}
					header={
						<Antd.List.Item>
							<Antd.List.Item.Meta avatar={<LayerIcon {...item} />} title={t(item.name)} />
						</Antd.List.Item>
					}
					key={index}>
					<Document {...configuration.documents[item.description[getLanguageRState]]} />

					{!item.name.includes('Dronezone') && (
						//all other zones than NOTAMs (dronezones) have toggles
						<div className={'layerSwitches'}>
							<h3>{t('Til- og fravalg af lag')}</h3>
							{[...item.tilesets].map((tileset, index) => (
								<>
									{tileset.toggleable ? (
										<h4 key={`layer-${index}`}>
											{t(tileset.id)}
											<Switch
												id={tileset.id}
												onChange={toggleLayerSwitch}
												defaultChecked={getLayerState[tileset.id].toggled}
												key={`layer-switch-${index}`}
												className={'layerSwitch'}
											/>
										</h4>
									) : (
										//Not toggleable
										<Tooltip
											key={`layer-tooltip-${index}`}
											title={t('Dette lag kan ikke fravælges')}
											placement={screenTypeS === EScreenType.DESKTOP ? 'left' : 'top'}>
											<h4 key={`layer-${index}`}>
												{t(tileset.id)}
												<Switch key={tileset.id} className={'layerSwitch disabled'} disabled unCheckedChildren={<Icon name={'times'} icon={faTimes} />} />
											</h4>
										</Tooltip>
									)}
								</>
							))}
						</div>
					)}
				</Antd.Panel>
			))}
		</Antd.Collapse>
	);
};

interface ISettingsPanelProps {
	visible?: boolean;
	mapTypes: TSettingsMapType[];
	mapLayers: TSettingsMapLayer[];
	map: mapboxgl.Map | undefined;
}

export const SettingsPanel: React.FC<ISettingsPanelProps> = (props) => {
	const [t] = useTranslation('translations');
	const [getTerrainState, setTerrainState] = useRecoilState(Recoil.MapTerrain.Selector);
	const getLayerRAState = useRecoilValue(Recoil.MapLayerGroup.Atom);

	return (
		<SidePanel visible={props.visible ? props.visible : false}>
			<div className={'map_settings_panel'}>
				<div className={'section background'}>
					<h2>{t('Baggrundskort')}</h2>
					<MapSettingsBackgroundList
						mapTypes={props.mapTypes}
						onChange={(activeBackground) => props.map?.fire('changeBackground', { background: activeBackground })}
					/>
				</div>
				<div className={'section details'}>
					<h2>
						{t('Detaljeret visning')}
						<Switch
							defaultChecked={getLayerRAState === 1 ? true : false}
							onChange={(activeLayer) => props.map?.fire('changeLayer', { layer: activeLayer ? 1 : 0 })}
						/>
					</h2>
					<h2>
						<Antd.Tooltip placement={'bottomLeft'} title={`${t('Virker bedst med kontur- og satelitkort')}.`}>
							{t('3D terræn')}
						</Antd.Tooltip>
						<Switch
							defaultChecked={getTerrainState}
							checked={getTerrainState}
							onChange={(val) => {
								setTerrainState(val);
							}}
						/>
					</h2>
				</div>
				<div className={'section'}>
					<h2>{t('Farveanvendelse')}</h2>
					<MapSettingsLayerList mapLayers={props.mapLayers} map={props.map} />
				</div>
			</div>
		</SidePanel>
	);
};
