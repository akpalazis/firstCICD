const express = require('express');
const {authRouter} = require('./auth/auth');
const {tokenRouter} = require('./tokens/token');
const {connectDB} = require('./db');
const bodyParser = require('body-parser');


//TODO: The validate-token is not working as expected
//TODO: Make the middleware that will check the tokens

connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',authRouter);
app.use('/',tokenRouter);

// Use the imported files for different endpoints
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = address