import React, { createRef, useEffect } from 'react';
import { Drawer, IDrawerRef } from '@naviair-utm/react-shared-components';
import { Recoil, useRecoilValue } from '../../../Recoil';
import { EScreenType } from '@naviair-utm/node-shared-interfaces';
import './styles.scss';

interface ISidePanelProps {
	visible?: boolean;
}

export const SidePanel: React.FC<ISidePanelProps> = (props) => {
	const drawerRef = createRef<IDrawerRef>();
	const screenTypeS = useRecoilValue(Recoil.ScreenType.Atom);

	useEffect(() => {
		props.visible ? drawerRef.current?.open() : drawerRef.current?.close();
	}, [props.visible]);

	return (
		<Drawer
			renderInDom
			className={screenTypeS === EScreenType.MOBILE ? 'mobile sidePanelZIndex' : 'sidePanelZIndex'}
			keyboard={false}
			mask={false}
			closable={false}
			zIndex={2}
			width={300}
			ref={drawerRef}>
			{props.children}
		</Drawer>
	);
};
