const path = require('path');

module.exports = {
  entry: {
    index: './src/app.js',
  },
  output: {
    path: path.join(__dirname, '../dist'),
  },
  target: 'node',
};