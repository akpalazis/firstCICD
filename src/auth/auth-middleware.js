
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

function validateTokenMiddleware(req,res,next){
  //TODO: change that with request to the validation endpoint
  return tokenValidationMiddleware(req,res,next)
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