const bcrypt = require("bcryptjs")
const express = require('express');
const router = express.Router();
const {
  createUser,
  isUserExists,
  isValidUser,
  deleteUser,
  fetchEntries} = require("./db")


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

router.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username, password)
    await isValidUser(username,password)
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
    await isUserExists(username)
    await createUser(username,password)
    return res.status(200).send("User Successfully Created")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.delete('/delete/:userId', async (req, res) => {
  try {
    const username = req.params.userId
    await canDelete(username)
    await deleteUser(username)
    return res.status(200).send("User Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.delete('/delete', async (req, res) => {
    return res.status(400).send("No User provided");
});

const canDelete = async (username) =>{
  const entries = await fetchEntries(username)
    if(entries.rows.length===0){
      throw new Error("Username not Found")
    }
}


module.exports = router



const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password,10)
  } catch (e) {
    throw new Error(e)
  }
}

