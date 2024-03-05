const axios = require("axios")
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
  validateTokenMiddleware} = require('./auth-middleware')

// TODO: then test the end points - integration test
// TODO: make the change that the cookie will store on auth and not on tokens
// TODO: make request to the validate endpoint in the tokens
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
    async (req,res)=>{
    return await axios.post('http://localhost:3000/generateTokens/1')
    .then(response => {
      if ((response.status === 200) && (response.data.message === "Token Generated Successfully")){
        const tokens = response.data.tokens
        res.cookie('accessToken', tokens.access, {httpOnly: true, secure: false, sameSite: 'strict'});
        res.cookie('refreshToken', tokens.refresh, {httpOnly: true, secure: false, sameSite: 'strict'});
        return res.status(200).send('Login Successful');
      }
    })
    .catch(error => {
      return res.status(500).send("Internal server error");
    });
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

module.exports = {authRouter}


