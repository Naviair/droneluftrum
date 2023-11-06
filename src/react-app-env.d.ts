/// <reference types="react-scripts" />

// elastic__apm-rum-react.d.ts
declare module '@elastic/apm-rum-react' {
	import { ComponentType } from 'react';
	import { Route } from 'react-router';
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const ApmRoute: typeof Route;

	/**
	 * Wrap a component to record an elastic APM transaction while it is rendered.
	 *
	 * Usage:
	 *  - Pure function: `withTransaction('name','route-change')(Component)`
	 *  - As a decorator: `@withTransaction('name','route-change')`
	 */
	export const withTransaction: (name: string, eventType: string) => <T>(component: ComponentType<T>) => ComponentType<T>;
}

declare module '*.svg' {
	import React = require('react');
	export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
	const src: ComponentType<string>;
	// eslint-disable-next-line import/no-default-export
	export default src;
}

declare module '*.png' {
	const value: any;
	export = value;
}
