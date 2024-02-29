const jwt = require('jsonwebtoken');

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

const validateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  const accessSecretKey = 'access-secret-key';
  if (!token) {
    return res.status(401).send('Unauthorized - JWT is missing' );
  }
  try {
    const tokenStartIndex = token.indexOf('=') + 1; // Find the index after '='
    const tokenEndIndex = token.indexOf(';'); // Find the index before ';'
    const new_token = token.slice(tokenStartIndex, tokenEndIndex);
    // Verify the JWT
    jwt.verify(new_token, accessSecretKey);
  } catch (err) {
    return res.status(401).send('Unauthorized - Invalid JWT' );
  }
  next()
};

module.exports = {validateData, validateJWT}