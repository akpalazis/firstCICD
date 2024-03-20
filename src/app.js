const express = require('express');
const {authRouter} = require('./auth/auth');
const {tokenRouter} = require('./tokens/token');
const {adminRouter} = require('./admin/admin');
const {connectDB} = require('./db');
const bodyParser = require('body-parser');


connectDB()

const app = express();
app.use(bodyParser.json());
app.use('/',authRouter);
app.use('/',tokenRouter);
app.use('/',adminRouter);

// Use the imported files for different endpoints
const PORT = process.env.PORT || 3000;
const address = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = address