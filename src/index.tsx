import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { App } from './Views/App/App';
import * as serviceWorker from './serviceWorker';
import { RecoilRoot } from 'recoil';
import { BrowserRouter as Router, Switch, Redirect, RouteComponentProps } from 'react-router-dom';
import './Styles/AntDesign.less';
import './Styles/Styles.scss';
import { ErrorView } from './Views/Error/Error';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { init as initApm } from '@elastic/apm-rum';
import { ApmRoute } from '@elastic/apm-rum-react';
import pkg from '../package.json';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IErrorViewProps, LoadOverlay } from '@naviair-utm/react-shared-components';

/**
 * Elastic APM
 * Distinguishes between 'production' and 'development'.
 * All metrics currently uploaded to production APM RUM server.
 **/
initApm({
	serviceName: process.env.REACT_APP_ELASTIC_APM_SERVICE_NAME,
	serverUrl: process.env.REACT_APP_ELASTIC_APM_SERVER,
	/* Using this approach instead of process.env.NODE_ENV 
	   Because we build "production" mode on dev site. (to mimic prd build as close as possible)*/
	environment: process.env.REACT_APP_ENVIRONMENT === 'PRD' ? 'production' : 'development',
	serviceVersion: '1',
	active: true,
});

Sentry.init({
	dsn: process.env.REACT_APP_SENTRY_DSN,
	integrations: [new Integrations.BrowserTracing()],
	tracesSampleRate: 1.0,
	release: `${pkg.version}`,
	environment: `${process.env.REACT_APP_ENVIRONMENT}`,
});

ReactDOM.render(
	<React.StrictMode>
		<RecoilRoot>
			<Suspense fallback={<LoadOverlay loading title={'Naviair UTM'} subtitle={'Powered by Naviair'} />}>
				<Router>
					<Switch>
						<Redirect exact path={'/'} to={'/app'} />
						<ApmRoute path={'/app'} component={(props: RouteComponentProps) => <App {...props} />} />
						<ApmRoute path={'/error/:errorCode'} component={(props: RouteComponentProps<IErrorViewProps>) => <ErrorView {...props} />} />
						<ApmRoute path={'*'} component={() => <Redirect to={'/error/404'} />} />
					</Switch>
				</Router>
			</Suspense>
		</RecoilRoot>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
