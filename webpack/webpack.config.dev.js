const {merge} = require('webpack-merge');
const commonConfig = require("../webpack/webpack.config.common")

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: 'dev_index.js',
  },
});


