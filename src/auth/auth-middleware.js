const axios = require('axios');
const {validateData,generateHashCredentials} = require("./auth-tools")
const {userDatabaseTools} = require("./auth-db-tools")
const {TOKEN_URL} = require("../constants")

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

function isUserValidMiddleware(req, res, next) {
  userDatabaseTools.isValidUser(req.body)
    .then(() => {
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
  const tokens = req.headers.authorization
  return await axios.post('http://token:3001/validate-token',null,
    {headers:{
      Authorization:tokens
      }})
    .then((response) => {
      if ((response.status === 200) && (response.data === "Token is Valid")){
        return next()
      }
    })
    .catch(error => {
      return res.status(500).send("Internal server error");
    });
}

async function fetchTokenMiddleware(req,res,next){
  return await axios.post('http://token:3000/generateTokens/1')
    .then(response => {
      if ((response.status === 200) && (response.data.message === "Token Generated Successfully")){
        res.locals.tokens = response.data.tokens
        return next()
      }
    })
    .catch((error) => {
      return res.status(500).send(error.message);
    });
}
function storeTokens(req,res,next){
  try {
    const tokens = res.locals.tokens
    res.cookie('accessToken', tokens.access, {httpOnly: true, secure: false, sameSite: 'strict'});
    res.cookie('refreshToken', tokens.refresh, {httpOnly: true, secure: false, sameSite: 'strict'});
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