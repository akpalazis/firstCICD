const express = require('express');
const authRouter = express.Router();
const {userDatabaseTools} = require("./auth-db-tools")
const {tokenValidation,allowLoginUsers} = require("./token-validators")
const {
  dataValidationMiddleware,
  generateHashMiddleware,
  userExistsMiddleware,
  createUserMiddleware,
  isUserValidMiddleware,
  canDeleteMiddleware,
  deleteUserMiddleware} = require('./auth-middleware')

// TODO: make all the endpoints following middleware structure
// TODO: first test all the functions that are correct - unity test
// TODO: then test the end points - integration test

authRouter.get('/',
  allowLoginUsers(true),
  tokenValidation(),
  async (req,res)=>{
    return res.status(200).send("JWT token is valid");
  }
)

authRouter.get('/login',
  allowLoginUsers(false),
  async (req,res)=>{
      return res.status(200).send("login page");
  }
)

authRouter.post('/login',
  allowLoginUsers(false),
  dataValidationMiddleware,
  isUserValidMiddleware,
  async (req, res) => {
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

module.exports = {authRouter}


