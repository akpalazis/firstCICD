const jwt = require('jsonwebtoken');
const {tokenDatabase} = require('./db')
require('dotenv').config();

// Secret keys for access and refresh tokens
const accessSecretKey = process.env.AUTH_SECRET_KEY
const refreshSecretKey = process.env.REFRESH_SECRET_KEY


const validateData = async (username, password) => {
    if ((username === undefined) && (password === undefined)) {
      throw new Error("Username and Password field not found");
    }
    if (username === undefined){
      throw new Error("Username field not found")
    }
    if (password === undefined){
      throw new Error("Password field not found")
    }

    if ((!username) && (!password)){
      throw new Error("Empty Username and Password Field")
    }
    if (!username){
      throw new Error("Empty Username Field")
    }

    if (!password){
      throw new Error("Empty Password Field")
    }
};

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
        return  {isValid:false,isExpired:true}
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

const tokenValidation = async (req, res, next) => {
  const tokens = req.headers.authorization;

  if (!tokens) {
    return res.status(401).send('Unauthorized - JWT is missing' );
  }
  try {
    const [accessTokenCookie, refreshTokenCookie] = tokens.split(',');
    if ((!accessTokenCookie) ||(!refreshTokenCookie)){
        return res.status(401).send(`Unauthorized - Found Only Single JWT`);
    }
    const accessToken = stripToken(accessTokenCookie)
    const refreshToken = stripToken(refreshTokenCookie)
    const accessTokenData = isTokenValid(accessToken,accessSecretKey)
    const refreshTokenData = isTokenValid(refreshToken,refreshSecretKey)
    if (accessTokenData.isExpired){
      if(refreshTokenData.isExpired){
        return res.status(401).send('Unauthorized - Refresh Token Expired')
      }
      if (!refreshTokenData.isValid){
        return res.status(401).send('Unauthorized - Invalid Refresh Token')
      }
      if (await checkTokenSingleUse(refreshTokenData)){
        // TODO: rotate keys
        return res.status(200).send('Unauthorized - Generating new tokens');
      }
      return res.status(401).send('Unauthorized - Reload Token already used')
    }
    if (!accessTokenData.isValid){
          return res.status(401).send(`Unauthorized - JWT MALFORMED`);
    }
  } catch (err) {
    const errorMessage = err.message.toUpperCase()
    return res.status(401).send(`Unauthorized - ${errorMessage}`);
  }
  next()
};

module.exports = {validateData, validateJWT: tokenValidation}