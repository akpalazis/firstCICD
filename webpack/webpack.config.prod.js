const {merge} = require('webpack-merge');
const commonConfig = require("../webpack/webpack.config.common")

module.exports = merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'prod_index.js',
  },
});