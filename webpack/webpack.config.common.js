const path = require('path');

module.exports = {
  entry: {
    auth: './src/auth/index.js',
    token: './src/tokens/index.js'
  },
  output: {
    path: path.join(__dirname, '../dist'),
  },
  target: 'node',
};