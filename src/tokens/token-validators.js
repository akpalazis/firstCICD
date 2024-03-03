const jwt = require('jsonwebtoken');
const {tokenDatabase} = require('./token-db-tools')
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require('../constants')

// Secret keys for access and refresh tokens


const stripToken = (token) => {
  if (token.includes("=")) {
    const tokenStartIndex = token.indexOf('=') + 1; // Find the index after '='
    const tokenEndIndex = token.indexOf(';'); // Find the index before ';'
    return token.slice(tokenStartIndex, tokenEndIndex).trim();
  }else{
    return token.replace("Bearer ","").trim()
  }
}


const isTokenValid = (token,secretKey) =>{
  return jwt.verify(token,secretKey,(err,decoded)=>{
    if(err){
      if (err.name == 'TokenExpiredError'){
        return  {isValid:true,isExpired:true}
      }
      return  {isValid: false,isExpired: false}
    } else{
      return  {isValid: true,isExpired: false, decodedToken:decoded, token:token}
    }
  })
}

const checkTokenSingleUse = async (refreshTokenData) => {
  const decodedData = refreshTokenData.decodedToken
  const token = refreshTokenData.token
  const storedToken = await tokenDatabase.fetchRefreshToken(decodedData.userId)
  return (token === storedToken.token)
}

function tokenValidation() {
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
      console.log(err)
      const errorMessage = err.message.toUpperCase()
      return res.status(401).send(`Unauthorized - ${errorMessage}`);
    }
    next()
  };
}

module.exports = {tokenValidation}