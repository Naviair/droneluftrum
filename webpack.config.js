const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const dotenv = require('dotenv');
const fs = require('fs'); // to check if the file exists
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const pkg = require('./package.json');

module.exports = (env, options) => {
	/* START OF HANDLING ENV */

	// Get the root path (assuming your webpack config is in the root of your project!)
	const currentPath = path.join(__dirname);

	// Create the fallback path (the production .env)
	const basePath = currentPath + '/.env';

	// We're concatenating the environment name to our filename to specify the correct env file!
	const envPath = './env/.env.' + env.ENVIRONMENT;

	// Check if the file exists, otherwise fall back to the production .env
	const finalPath = fs.existsSync(envPath) ? envPath : basePath;

	// Set the path parameter in the dotenv config
	const fileEnv = dotenv.config({ path: finalPath }).parsed;

	// reduce it to a nice object, the same as before (but with the variables from the file)
	const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
		return prev;
	}, {});

	/* END OF HANDLING ENV */

	return {
		// webpack will take the files from ./src/index
		entry: './src/index',
		// and output it into /dist as bundle.js
		output: {
			//path: path.join(__dirname, '/dist'),
			filename: 'bundle.js',
			publicPath: '/',
		},
		// adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.scss', '.less'],
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					enforce: 'pre',
					use: ['source-map-loader'],
					exclude: [path.join(process.cwd(), 'node_modules/react-responsive')],
				},
				// we use babel-loader to load our jsx and tsx files
				{
					test: /\.(ts|js)x?$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					},
				},
				// css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
				{
					test: /\.(css)$/,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.(less)$/,
					use: [
						'style-loader',
						'css-loader',
						{
							loader: 'less-loader',
							options: {
								lessOptions: {
									javascriptEnabled: true,
								},
							},
						},
					],
				},
				{
					test: /\.(scss)$/,
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
				{
					test: /\.svg(\?.*)?$/, // match img.svg and img.svg?param=value
					use: [
						{
							loader: 'babel-loader',
						},
						{
							loader: 'react-svg-loader',
							options: {
								jsx: false, // true outputs JSX tags
							},
						},
					],
				},
				{
					test: /\.(png|jpg|jpeg|gif|ico)$/i,
					exclude: /node_modules/,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 10000,
								name: 'static/media/[name].[hash:8].[ext]',
							},
						},
					],
				},
			],
		},
		node: {
			fs: 'empty',
		},
		devServer: {
			historyApiFallback: true,
			host: 'localhost',
			disableHostCheck: true,
		},
		optimization: {
			splitChunks: {
				// include all types of chunks
				chunks: 'all',
				maxSize: 1000000, //In bytes
			},
		},
		devtool: 'source-map', //'hidden-source-map', //process.env.NODE_ENV == 'development' ? 'inline-source-map' : 'hidden-source-map'
		plugins: [
			new HtmlWebpackPlugin({
				template: './public/index.html',
				favicon: './public/favicon.ico',
			}),
			new copyWebpackPlugin({
				patterns: [{ from: './public/ecosystem.config.js', to: './' }],
			}),
			new webpack.DefinePlugin(envKeys),
			new ESLintPlugin({
				//https://www.npmjs.com/package/eslint-webpack-plugin
				context: './src',
				extensions: ['ts', 'tsx', 'js', 'jsx'],
				failOnError: false,
				failOnWarning: false,
				lintDirtyModulesOnly: true,
				fix: false, //set to true to run eslint --fix on compile (should be done by VSCode instead)
			}),
			new SentryWebpackPlugin({
				// sentry-cli configuration
				authToken: process.env.REACT_APP_SENTRY_RELEASE_TOKEN,
				org: 'naviair-utm',
				project: 'naviair-utm_react-frontend',
				release: `${pkg.version}`,

				// webpack-specific configuration
				include: '.',
				ignore: ['node_modules', 'webpack.config.js'],
			}),
		],
	};
};
