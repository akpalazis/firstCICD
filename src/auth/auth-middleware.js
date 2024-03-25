const axios = require('axios');
const jwt = require('jsonwebtoken');
const {validateData,generateHashCredentials} = require("./auth-tools")
const {userDatabaseTools} = require("./auth-db-tools")
const {SERVER_SECRET_KEY} = require("../constants")


function dataValidationMiddleware(req, res, next) {
  const credentials = req.body;
  return validateData(credentials)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}

function generateHashMiddleware(req, res, next) {
  generateHashCredentials(req)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}

function userExistsMiddleware(req, res, next) {
  userDatabaseTools.isUserExists(req.body.username)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}

function createUserMiddleware(req, res, next) {
  userDatabaseTools.createUser(req.body)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}

async function isUserValidMiddleware(req, res, next) {
  userDatabaseTools.isValidUser(req.body)
    .then((response) => {
      res.locals.userId = response.id
      res.locals.role = response.role
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}

function canDeleteMiddleware(req, res, next) {
  userDatabaseTools.canDelete(req.params.userId)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}
function deleteUserMiddleware(req, res, next) {
  userDatabaseTools.deleteUser(req.params.userId)
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.status(400).send(err.message);
    });
}


async function fetchTokenMiddleware(req,res,next){
  const serverToken = jwt.sign({serverId:"auth-login"}, SERVER_SECRET_KEY, { expiresIn: "10s" });
  return await axios.post(`http://token:3000/generateTokens/`,res.locals,
    {
      headers:{
        serverToken:serverToken
      }
    })
    .then(response => {
      res.locals.newTokens = false
      if ((response.status === 200) && (response.data.message === "Token Generated Successfully")){
        if (response.data.tokens){
          res.locals.tokens = response.data.tokens
          res.locals.newTokens = true
        }
      }
      return next()
    })
    .catch((error) => {
      return res.status(500).send(error.message);
    });
}

module.exports = {
  dataValidationMiddleware,
  generateHashMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  isUserValidMiddleware,
  canDeleteMiddleware,
  deleteUserMiddleware,
  fetchTokenMiddleware}