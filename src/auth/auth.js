const express = require('express');
const authRouter = express.Router();
const {allowLoginUsersMiddleware} = require("./auth-middleware")
const {
  dataValidationMiddleware,
  generateHashMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  isUserValidMiddleware,
  canDeleteMiddleware,
  deleteUserMiddleware,
  validateTokenMiddleware,
  fetchTokenMiddleware,
  storeTokens} = require('./auth-middleware')

// TODO: then test the end points - integration test
authRouter.get('/',
  allowLoginUsersMiddleware(true),
  validateTokenMiddleware,
  async (req,res)=>{
    return res.status(200).send("JWT token is valid");
  }
)

authRouter.get('/login',
  allowLoginUsersMiddleware(false),
  async (req,res)=>{
      return res.status(200).send("login page");
  }
)

authRouter.post('/login',
  allowLoginUsersMiddleware(false),
  dataValidationMiddleware,
  isUserValidMiddleware,
    fetchTokenMiddleware,
    storeTokens,
    async (req,res)=>{
      return res.status(200).send('Login Successful');
  }
);

authRouter.post('/validate',
  dataValidationMiddleware, async (req,res)=> {
    return res.status(200).send('Valid User');
  }
)

authRouter.post('/signup',
  generateHashMiddleware,
  dataValidationMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  async (req, res) => {
      return res.status(200).send("User Successfully Created")
  });

authRouter.delete('/delete/:userId',
  canDeleteMiddleware,
  deleteUserMiddleware,
  async (req, res) => {
    return res.status(200).send("User Deleted Successfully")
  }
);

authRouter.delete('/delete', async (req, res) => {
    return res.status(400).send("No User provided");
});

authRouter.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});


module.exports = {authRouter}


