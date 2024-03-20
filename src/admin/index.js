const express = require('express');
const {adminRouter} = require('./admin');
const {connectDB} = require('../db');
const bodyParser = require('body-parser');

connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',adminRouter);

// Use the imported files for different endpoints
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Authentication Server is running on port ${PORT}`);
});

module.exports = address