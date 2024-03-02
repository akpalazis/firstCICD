const bcrypt = require("bcryptjs")
const express = require('express');
const authRouter = express.Router();
const {userDatabaseTools} = require("./auth-db-tools")
const {validateData} = require("./auth-validatiors")
const {tokenValidation} = require("./token-validators")


const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password,10)
  } catch (e) {
    throw new Error(e)
  }
}

authRouter.get('/',tokenValidation(false),async (req,res)=>{
    return res.status(200).send("JWT token is valid");
})

authRouter.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username, password)
    await userDatabaseTools.isValidUser(username,password)
    return res.status(200).send('Login Successful');
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post('/validate', async (req,res)=> {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username, password)
    return res.status(200).send('Valid User');
  } catch (err) {
    return res.status(400).send(err.message);
  }
})

authRouter.post('/signup', async (req, res) => {
  try {
    const username = req.body.username
    const password = await hashPassword(req.body.password)
    await validateData(username,password)
    await userDatabaseTools.isUserExists(username)
    await userDatabaseTools.createUser(username,password)
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

module.exports = {authRouter,hashPassword}


