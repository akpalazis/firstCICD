const {createTokensFor,storeTokens} = require("./token-tools")
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


module.exports = {createTokensMiddleware,storeTokenMiddleware,manipulateToken,deleteTokenMiddleware}


