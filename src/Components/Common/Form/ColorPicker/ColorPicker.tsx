import React, { useRef, useState } from 'react';
import { Antd } from '../../..';
import { SwatchesPicker } from 'react-color';
import { BgColorsOutlined } from '@ant-design/icons';
import './styles.scss';
import { useOutsideClick } from '../../../../Hooks';
import { useTranslation } from 'react-i18next';

export interface IColorPickerProps {
	name: string;
	label?: string | undefined;
	required?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_COLOR = '#512DA8';

export const ColorPicker: React.FC<IColorPickerProps> = (props) => {
	const [getShowState, setShowState] = useState<boolean>(false);
	const clickRef = useRef<HTMLDivElement>(null);
	const [t] = useTranslation('translations');

	useOutsideClick(clickRef, () => {
		getShowState && setShowState(false);
	});

	const ColorPickerBtn = () => (
		<div onClick={() => setShowState(!getShowState)} className={'colorPickerButton'}>
			<BgColorsOutlined />
		</div>
	);
	// eslint-disable-next-line react/forbid-dom-props
	const ColorShow = (props: { color: string }) => <div style={{ backgroundColor: props.color }} className={'colorShow'} />;

	interface IInputProps {
		value?: string;
		onChange?: (value: string) => void;
	}
	const Input: React.FC<IInputProps> = (props) => {
		const handleChange = (color: string) => {
			props.onChange?.(color);
		};

		return (
			<span>
				<Antd.Input
					disabled
					addonBefore={<ColorShow color={props.value ? props.value : DEFAULT_COLOR} />}
					defaultValue={DEFAULT_COLOR}
					value={props.value ? props.value.toUpperCase() : DEFAULT_COLOR.toUpperCase()}
					addonAfter={<ColorPickerBtn />}
				/>
				{getShowState && (
					<div className={'colorPickerPopup'} ref={clickRef}>
						<SwatchesPicker color={props.value ? props.value : DEFAULT_COLOR} onChange={(color) => handleChange(color.hex)} />
					</div>
				)}
			</span>
		);
	};

	return (
		<div>
			<Antd.Form.Item
				key={props.name}
				name={props.name}
				label={props.label}
				rules={[{ required: props.required ? props.required : false, message: props.required ? `${t('Udfyld')} ${props.label}` : undefined }]}>
				<Input />
			</Antd.Form.Item>
		</div>
	);
};
