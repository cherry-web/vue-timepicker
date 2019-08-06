const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./base.config');

// 合并基础配置生成开发环境配置（可以先发起await http）
const prodConfig = Object.assign(baseConfig, {
	entry: ['./src/index.js'],
	output: {
		path: path.resolve(__dirname, '../lib'),
		publicPath: '/lib/',
		filename: 'index.js',
		library: 'CommonComponent',
		libraryTarget: 'umd',
		umdNamedDefine: true,
	},
	devtool: '#source-map',
});

prodConfig.plugins.push(
	...[
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"',
			},
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false,
			},
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]
);

module.exports = prodConfig;
