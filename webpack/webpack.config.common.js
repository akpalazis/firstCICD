const path = require('path');

module.exports = {
  entry: {
    auth: './src/auth/index.js',
    token: './src/tokens/index.js',
    admin: './src/admin/index.js'
  },
  output: {
    path: path.join(__dirname, '../dist'),
  },
  target: 'node',
};