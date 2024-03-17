const express = require('express');
const {tokenRouter} = require('./token');
const {connectDB} = require('../db');
const bodyParser = require('body-parser');

connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',tokenRouter);

// Use the imported files for different endpoints
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Token Server is running on port ${PORT}`);
});

module.exports = address