const {axios} = require('axios');
const {validateData,generateHashCredentials} = require("./auth-tools")
const {userDatabaseTools} = require("./auth-db-tools")
const {tokenValidationMiddleware} = require("../tokens/token-middleware")

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
  return await axios.post('http://localhost:3000/generateTokens/1')
    .then((response) => {
      console.log(response.data)
      if ((response.status === 200) && (response.data === "Token Generated Successfully")){
        return next()
      }
    })
    .catch(error => {
      console.log(error)
      return res.status(500).send("Internal server error");
    });
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
  validateTokenMiddleware}