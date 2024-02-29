const bcrypt = require("bcryptjs")
const express = require('express');
const router = express.Router();
const {UserDatabase} = require("./db")
const {validateData, validateJWT} = require("./validators")

const userDatabase = new UserDatabase();

router.post('/validate', async (req,res)=> {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username, password)
    return res.status(200).send('Valid User');
  } catch (err) {
    return res.status(400).send(err.message);
  }
})

router.get('/',validateJWT,async (req,res)=>{
    return res.status(200).send("JWT token is valid");
})

router.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username, password)
    await userDatabase.isValidUser(username,password)
    return res.status(200).send('Login Successful');
  } catch (err) {
    return res.status(400).send(err.message);
  }
});


router.post('/signup', async (req, res) => {
  try {
    const username = req.body.username
    const password = await hashPassword(req.body.password)
    await validateData(username,password)
    await userDatabase.isUserExists(username)
    await userDatabase.createUser(username,password)
    return res.status(200).send("User Successfully Created")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.delete('/delete/:userId', async (req, res) => {
  try {
    const username = req.params.userId
    await userDatabase.canDelete(username)
    await userDatabase.deleteUser(username)
    return res.status(200).send("User Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.delete('/delete', async (req, res) => {
    return res.status(400).send("No User provided");
});



module.exports = router



const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password,10)
  } catch (e) {
    throw new Error(e)
  }
}

