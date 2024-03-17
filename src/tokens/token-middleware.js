const {createTokensFor,stripToken,isTokenValid,checkTokenSingleUse} = require("./token-tools")
const {tokenDatabase} = require("./token-db-tools")
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY,SERVER_SECRET_KEY} = require("../constants")
const jwt = require('jsonwebtoken');


function createExpiredTokensMiddleware(req, res, next) {
  try {
    const {userID} = req.params
    let accessTime = '-1s'
    let refreshTime = '-1s'
    if (req.body.accessTime){accessTime=req.body.accessTime}
    if (req.body.refreshTime){refreshTime=req.body.refreshTime}
    res.locals.tokens = createTokensFor(userID, accessTime, refreshTime)
    next()
  } catch(err){
    return res.status(400).send(err.message)
  }
}

function createTokensMiddleware(req, res, next) {
  try {
    const userID = req.params.userId
    let accessTime = '15m'
    let refreshTime = '7d'
    if (req.body.accessTime){accessTime=req.body.accessTime}
    if (req.body.refreshTime){refreshTime=req.body.refreshTime}
    res.locals.tokens = createTokensFor(userID, accessTime, refreshTime)
    next()
  } catch(err){
    return res.status(400).send(err.message)
  }
}

function validateServerTokenMiddleware(req,res,next){
  const serverToken = req.headers.servertoken;
  jwt.verify(serverToken,SERVER_SECRET_KEY,(err,decoded)=> {
  if (err) {
    console.log(err)
    return res.status(400).send("Unauthorized Access")
  }
  else{
    next()
  }
})
}

function storeTokenMiddleware(req,res,next){
  const tokens = res.locals.tokens
  const refreshToken = tokens.refresh
  return tokenDatabase.storeToken(refreshToken)
    .then(()=> {
      next()
    })
    .catch(err=>{
    return res.status(400).send(err.message)
  })
}

function deleteTokenMiddleware(req,res,next){
  const userId = req.params.userId
  return tokenDatabase.deleteToken(userId)
    .then(()=>next())
    .catch((err)=>{
      return res.status(400).send(err.message);
      })

}

function tokenValidationMiddleware() {
  return async function(req, res, next){
    const tokens = req.headers.authorization;
    try {
      const [accessTokenCookie, refreshTokenCookie] = tokens.split(',');
      const accessToken = stripToken(accessTokenCookie)
      const refreshToken = stripToken(refreshTokenCookie)
      const accessTokenData = isTokenValid(accessToken, AUTH_SECRET_KEY)
      const refreshTokenData = isTokenValid(refreshToken, REFRESH_SECRET_KEY)
      if ((!accessToken) || (!refreshToken)) {
        return res.status(400).send(`Unauthorized - Found Only Single JWT`);
      }
      if (accessTokenData.isExpired) {
        if (refreshTokenData.isExpired) {
          return res.status(400).send('Unauthorized - Refresh Token Expired')
        }
        if (!refreshTokenData.isValid) {
          return res.status(400).send('Unauthorized - Invalid Refresh Token')
        }
        if (await checkTokenSingleUse(refreshTokenData)) {
          req.params.userId = refreshTokenData.decodedToken.userId
          createTokensMiddleware(req,res,next)
          await storeTokenMiddleware(req,res,next)
          return next()
        }
        return res.status(400).send('Unauthorized - Reload Token already used')
      }
      if (!accessTokenData.isValid) {
        return res.status(400).send(`Unauthorized - JWT MALFORMED`);
      }
    } catch (err) {
      const errorMessage = err.message.toUpperCase()
      return res.status(400).send(`Unauthorized - ${errorMessage}`);
    }
    return next()
  };
}

module.exports = {
  validateServerTokenMiddleware,
  createExpiredTokensMiddleware,
  createTokensMiddleware,
  storeTokenMiddleware,
  deleteTokenMiddleware,
  tokenValidationMiddleware
}


