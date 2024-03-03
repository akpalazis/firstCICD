const {createTokensFor,stripToken,isTokenValid,checkTokenSingleUse} = require("./token-tools")
const {tokenDatabase} = require("./token-db-tools")

function manipulateToken(req,res,next){
  res.locals.tokens = req.body
  next()
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

function storeTokenMiddleware(req,res,next){
  const tokens = res.locals.tokens
  const accessToken = tokens.access
  const refreshToken = tokens.refresh
  res.cookie('accessToken', accessToken, {httpOnly: true, secure: false, sameSite: 'strict'});
  res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: false, sameSite: 'strict'});
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
    if (!tokens) {
      return res.status(401).send('Unauthorized - JWT is missing');
    }
    try {
      const [accessTokenCookie, refreshTokenCookie] = tokens.split(',');
      if ((!accessTokenCookie) || (!refreshTokenCookie)) {
        return res.status(401).send(`Unauthorized - Found Only Single JWT`);
      }
      const accessToken = stripToken(accessTokenCookie)
      const refreshToken = stripToken(refreshTokenCookie)
      const accessTokenData = isTokenValid(accessToken, AUTH_SECRET_KEY)
      const refreshTokenData = isTokenValid(refreshToken, REFRESH_SECRET_KEY)

      if (accessTokenData.isExpired) {
        if (refreshTokenData.isExpired) {
          return res.status(401).send('Unauthorized - Refresh Token Expired')
        }
        if (!refreshTokenData.isValid) {
          return res.status(401).send('Unauthorized - Invalid Refresh Token')
        }
        if (await checkTokenSingleUse(refreshTokenData)) {
          // TODO: rotate keys
          return res.status(200).send('Unauthorized - Generating new tokens');
        }
        return res.status(401).send('Unauthorized - Reload Token already used')
      }
      if (!accessTokenData.isValid) {
        return res.status(401).send(`Unauthorized - JWT MALFORMED`);
      }
    } catch (err) {
      const errorMessage = err.message.toUpperCase()
      return res.status(401).send(`Unauthorized - ${errorMessage}`);
    }
    next()
  };
}

module.exports = {
  createTokensMiddleware,
  storeTokenMiddleware,
  manipulateToken,
  deleteTokenMiddleware,
  tokenValidationMiddleware}


