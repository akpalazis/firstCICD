const express = require('express');
const auth = require('./auth');
const token = require('./token');
const {connectDB} = require('./db');
const bodyParser = require('body-parser');


connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',auth);
app.use('/',token);

// Use the imported files for different endpoints

console.log(process.env.JENKINS)
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = address