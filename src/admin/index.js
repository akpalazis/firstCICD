const express = require('express');
const {authRouter} = require('./admin');
const {connectDB} = require('../db');
const bodyParser = require('body-parser');

connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',authRouter);

// Use the imported files for different endpoints
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Authentication Server is running on port ${PORT}`);
});

module.exports = address