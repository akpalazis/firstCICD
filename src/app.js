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


const PORT = process.env.PORT || 3000;
console.log(process.env.AUTH_SECRET_KEY)
console.log(process.env.REFRESH_SECRET_KEY)
console.log(process.env.HOST)
console.log(process.env.DB_URL)
const address = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = address