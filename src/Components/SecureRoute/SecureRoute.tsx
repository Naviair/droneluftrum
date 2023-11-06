import { ApmRoute } from '@elastic/apm-rum-react';
import React, { useEffect } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { fbAuth } from '../../Firebase';
import { Recoil } from '../../Recoil';
import { LoginView } from '../../Views/App';

export const SecureRoute: React.FC<{ render: (props: RouteComponentProps) => React.FC | JSX.Element; path: string }> = (props) => {
	//Take the 4 function from the array
	const setGLoadingRState = useSetRecoilState(Recoil.GeneralLoading.Atom);
	const setShowRegisterModal = useSetRecoilState(Recoil.RegisterModal.Atom);
	const setShowResetModal = useSetRecoilState(Recoil.ResetModal.Atom);

	const getLoginStatus = fbAuth()[4];

	useEffect(() => {
		// Set the global loading state to false. We just want to show the login view.
		setGLoadingRState(false);
	}, []);

	if (getLoginStatus()) {
		/* Use regular Route component because we are not interested in metrics from '/list/' in particular. */
		return <Route path={props.path} render={props.render} />;
	} else {
		return (
			<ApmRoute
				key={'login'}
				component={() => (
					<LoginView
						showWarning
						id={'secure'}
						mask={false}
						renderInDom
						visible={!getLoginStatus()}
						closable={false}
						maskClosable={false}
						zIndex={0}
						signUpState={() => setShowRegisterModal(true)}
						resetState={() => setShowResetModal(true)}
					/>
				)}
			/>
		);
	}
};
