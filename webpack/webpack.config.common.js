const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    token: './src/token.js',
  },
  output: {
    path: path.join(__dirname, '../dist'),
  },
  target: 'node',
};