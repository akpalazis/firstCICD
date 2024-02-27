const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new Client({
  connectionString: 'postgres://postgres:pass@192.168.1.182:5433/postgres',
});
db.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

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

app.post('/login', async (req, res) => {
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


app.post('/signup', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    await validateData(username,password)
    await isUserExists(username)
    await createUser(username,password)
    return res.status(200).send("User Successfully Created")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

app.delete('/delete/:userId', async (req, res) => {
  try {
    const username = req.params.userId
    await deleteUser(username)
    return res.status(200).send("User Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

const createUser = async (username,password) => {
  try {
    const query = 'INSERT INTO users(username, password) VALUES($1, $2)'
    await db.query(query, [username, password]);
  } catch (err) {
    throw new Error(err)
  }
}

const fetchEntries = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1'
  return  await db.query(query, [username])
}

const isUserExists = async (username) =>{
    const entries = await fetchEntries(username)
    if(entries.rows.length>0){
      throw new Error("User Already Exists")
    }
}

const isValidUser = async (username,password) => {
  const entries = await fetchEntries(username)
  if (entries.rows.length===0){
    throw new Error("Username not Found")
  }
  const user = entries.rows[0]
  if ((user.username !== username) || (user.password !== password)){
    throw new Error("Username does not match with password")
  }
}

const deleteUser = async (username) => {
  try {
    const query = 'DELETE FROM users WHERE username = $1'
    await db.query(query, [username]);
  } catch (e) {
    throw new Error(e)
  }
}




const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address

// TODO: Recreate the db and make sure the admin pass is in there
// TODO: upload the db to the docker
// TODO: make sure the tests are running as expected
// TODO: crate the Jenkins file and make sure that the docker works and the tests are running on docker
// TODO: Kill docker and finish the pipeline.