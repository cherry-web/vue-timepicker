const path = require('path');
function resolve(dir) {
	return path.join(__dirname, '..', dir);
}

module.exports = {
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js', //使用别名
		},
	},
	externals: {
		vue: 'Vue',
	},
	performance: {
		hints: false,
	},
	plugins: [],
	module: {
		rules: [
			{
				test: /\.(js|vue)$/,
				loader: 'eslint-loader',
				enforce: 'pre',
				include: [resolve('src'), resolve('test')],
				options: {
					formatter: require('eslint-friendly-formatter'),
				},
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.(less|css)$/,
				loader: 'style-loader!css-loader!less-loader',
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
		],
	},
};
