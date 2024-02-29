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
    // Verify the JWT
    jwt.verify(token, accessSecretKey);
  } catch (err) {
    return res.status(401).send('Unauthorized - Invalid JWT' );
  }
};

module.exports = {validateData, validateJWT}