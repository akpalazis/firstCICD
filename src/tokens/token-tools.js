const jwt = require('jsonwebtoken');
const {tokenDatabase} = require('./token-db-tools')
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require('../constants')

function createTokensFor(userData,accessTokenTime,refreshTokenTime){
    const accessToken = jwt.sign(userData, AUTH_SECRET_KEY, { expiresIn: accessTokenTime });
    const refreshToken = jwt.sign(userData, REFRESH_SECRET_KEY, {expiresIn: refreshTokenTime});
    return {access:accessToken,
            refresh:refreshToken}
}

const stripToken = (token) => {
  if (token.includes("=")) {
    const tokenStartIndex = token.indexOf('=') + 1; // Find the index after '='
    const tokenEndIndex = token.indexOf(';'); // Find the index before ';'
    return token.slice(tokenStartIndex, tokenEndIndex).trim();
  }else{
    return token.replace("Bearer","").trim()
  }
}

const isTokenValid = (token,secretKey) =>{
  return jwt.verify(token,secretKey,(err,decoded)=>{
    if(err){
      if (err.name === 'TokenExpiredError'){
        return  {isValid:true,isExpired:true}
      }
      return  {isValid: false,isExpired:false}
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


module.exports = {createTokensFor,stripToken,isTokenValid,checkTokenSingleUse}
