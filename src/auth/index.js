const express = require('express');
const {authRouter} = require('./auth');
const {connectDB} = require('../db');
const bodyParser = require('body-parser');


//TODO: Separate the validation with the auth! two different APPs that will be independent
//TODO: Call the validate token with an api not with the function
//TODO: Create the docker compose to have 2 APPs and write the integration tests
//TODO: Create role-permissions to a third app
// that will validate that the user has access to the endpoint based on the role
// Needs to create roles as mongoDB and add the role in the users database
// Create the tests for these functions / middleware and add these to integration tests!!!
// make the jenkins file to work as expected as soon as the validation is working push it into master
// create the pipeline to deploy the master branch

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