const jwt = require('jsonwebtoken');
const {fetchRefreshToken} = require('./db')

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
  const accessSecretKey = 'access-secret-key';
  const refreshSecretKey = 'refresh-secret-key';

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
        console.log("Cannot reload tokens sing in")
    } else {
        const dbRefreshToken = await fetchRefreshToken(refreshUserJWT.userId)
        if (dbRefreshToken !== refreshToken){
          console.log("Danger sign in")
        }
        console.log("reload tokens")
    }

  } catch (err) {
    return res.status(401).send('Unauthorized - Invalid JWT' );
  }
  next()
};

module.exports = {validateData, validateJWT}