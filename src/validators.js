const jwt = require('jsonwebtoken');
const {fetchRefreshToken} = require('./db')
require('dotenv').config();

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
  const tokenStartIndex = token.indexOf('=') + 1; // Find the index after '='
  const tokenEndIndex = token.indexOf(';'); // Find the index before ';'
  return token.slice(tokenStartIndex, tokenEndIndex);
}

const validateJWT = async (req, res, next) => {
  const tokens = req.headers.authorization;
  const accessSecretKey = process.env.AUTH_SECRET_KEY;
  const refreshSecretKey = process.env.REFRESH_SECRET_KEY

  if (!tokens) {
    return res.status(401).send('Unauthorized - JWT is missing' );
  }
  try {
    const [accessTokenCookie, refreshTokenCookie] = tokens.split(',');
    const accessToken = stripToken(accessTokenCookie)
    const refreshToken = stripToken(refreshTokenCookie)
    const accessUserJWT = jwt.verify(accessToken, accessSecretKey)
    if (accessUserJWT){
      return res.status(200).send('JWT token is valid' );
    }
    const refreshUserJWT = jwt.verify(refreshToken, refreshSecretKey)

    if (!refreshUserJWT){
    return res.status(401).send('Unauthorized - JWT expired' );
    } else {
        const dbRefreshToken = await fetchRefreshToken(refreshUserJWT.userId)
        if (dbRefreshToken !== refreshToken){
          console.log("Danger sign in")
        }
        console.log("reload tokens")
    }

  } catch (err) {
    const errorMessage = err.message.toUpperCase()
    console.log(`Unauthorized - ${errorMessage}`)
    return res.status(401).send(`Unauthorized - ${errorMessage}`);
  }
  next()
};

module.exports = {validateData, validateJWT}