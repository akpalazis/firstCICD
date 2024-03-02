const bcrypt = require("bcryptjs")
const express = require('express');
const authRouter = express.Router();
const {userDatabaseTools} = require("./auth-db-tools")
const {validateData} = require("./auth-validatiors")
const {tokenValidation,allowLoginUsers} = require("./token-validators")


authRouter.get('/',allowLoginUsers(true),tokenValidation(),async (req,res)=>{
    return res.status(200).send("JWT token is valid");
})

authRouter.get('/login',allowLoginUsers(false),async (req,res)=>{
      return res.status(200).send("login page");
})


authRouter.post('/login',allowLoginUsers(false), async (req, res) => {
  try {
    const credentials = req.body
    await validateData(credentials)
    await userDatabaseTools.isValidUser(credentials)
    return res.status(200).send('Login Successful');
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post('/validate', async (req,res)=> {
  try {
    const credentials = req.body
    await validateData(credentials)
    return res.status(200).send('Valid User');
  } catch (err) {
    return res.status(400).send(err.message);
  }
})

async function generateHashCredentials(credentials) {
  credentials.password = await bcrypt.hash(credentials.password,10)
  return credentials
}

authRouter.post('/signup', async (req, res) => {
  try {
    const credentials = await generateHashCredentials(req.body)
    await validateData(credentials)
    await userDatabaseTools.isUserExists(credentials.username)
    await userDatabaseTools.createUser(credentials)
    return res.status(200).send("User Successfully Created")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.delete('/delete/:userId', async (req, res) => {
  try {
    const username = req.params.userId
    await userDatabaseTools.canDelete(username)
    await userDatabaseTools.deleteUser(username)
    return res.status(200).send("User Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.delete('/delete', async (req, res) => {
    return res.status(400).send("No User provided");
});

module.exports = {authRouter}


