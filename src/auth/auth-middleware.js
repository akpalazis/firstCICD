const axios = require('axios');
const jwt = require('jsonwebtoken');
const {validateData,generateHashCredentials} = require("./auth-tools")
const {userDatabaseTools} = require("./auth-db-tools")
const {SERVER_SECRET_KEY} = require("../constants")

function allowLoginUsersMiddleware(registerer){
  return function (req,res,next) {
    const tokens = req.headers.authorization;
    if ((tokens && registerer) || (!tokens && !registerer)){
      return next()
    }
    return res.status(400).send("Unauthorized access")
  }
}

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
      res.locals.userId = response
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

async function validateTokenMiddleware(req,res,next){
  const serverToken = jwt.sign({serverId:"auth-login"}, SERVER_SECRET_KEY, { expiresIn: "10s" });
  return await axios.post('http://token:3000/validate-token',null,
    {
      headers:{
        Authorization:req.headers.authorization,
        serverToken:serverToken
      }})
    .then((response) => {
      if ((response.status === 200) && (response.data === "Token is Valid")){
        return next()
      }
    })
    .catch(error => {
      return res.status(400).send(error.response.data);
    });
}

async function fetchTokenMiddleware(req,res,next){
  const userId = res.locals.userId
  const serverToken = jwt.sign({serverId:"auth-login"}, SERVER_SECRET_KEY, { expiresIn: "10s" });
  return await axios.post(`http://token:3000/generateTokens/${userId}`,null,
    {
      headers:{
        serverToken:serverToken
      }
    })
    .then(response => {
      if ((response.status === 200) && (response.data.message === "Token Generated Successfully")){
        res.locals.tokens = response.data.tokens
        response.data.tokens = null
        return next()
      }
    })
    .catch((error) => {
      return res.status(500).send(error.message);
    });
}
function storeTokens(req,res,next){
  try {
    res.cookie('accessToken', res.locals.tokens.access, {httpOnly: true, secure: false, sameSite: 'strict'});
    res.cookie('refreshToken', res.locals.tokens.refresh, {httpOnly: true, secure: false, sameSite: 'strict'});
    res.locals.tokens = null
  } catch (e){
    console.log(e)
    return res.status(500).send("Internal server error")
  }
  next()
}

module.exports = {
  allowLoginUsersMiddleware,
  dataValidationMiddleware,
  generateHashMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  isUserValidMiddleware,
  canDeleteMiddleware,
  deleteUserMiddleware,
  validateTokenMiddleware,
  fetchTokenMiddleware,
  storeTokens}