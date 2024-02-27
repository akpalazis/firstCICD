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

//TODO: Validate password the same way as username

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    if ((username === undefined) && (password === undefined)){
      return res.status(400).send("Username and Password field not found")
    }
    if (username === undefined){
      return res.status(400).send("Username field not found")
    }

    if (password === undefined){
      return res.status(400).send("Password field not found")
    }

    if ((!username) && (!password)){
      return res.status(400).send("Empty Username and Password Field")
    }
    if (!username){
      return res.status(400).send("Empty Username Field")
    }

    if (!password){
      return res.status(400).send("Empty Password Field")
    }

    if (username) {
      if (await isUsernameExists(username)) {
        if (await isValidUser(username,password)){
          return res.status(200).send('Login Successful');
        }
        return res.status(400).send('Wrong Password')
      }
      return res.status(400).send("Username not Found")
    }
    return res.status(400).send('Empty Username Field')
  } catch (err) {
    return res.status(400).send(err.message);
  }
});


app.post('/signup', async (req, res) => {
  try {
    const username = req.body.username
    if (username) {
      if (await isUsernameExists(username)) {
        return res.status(400).send('User Already Exists');
      }
      //TODO: Create User
      return res.status(200).send("User Successfully Created")
    }
    return res.status(400).send('Empty Username Field')
  } catch (err) {
    return res.status(400).send(err.message);
  }
});


const fetchEntries = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1'
  return  await db.query(query, [username])
}

const isUsernameExists = async (username) => {
  const entries = await fetchEntries(username)
  return entries.rows.length > 0;
}

const isValidUser = async (username,password) => {
  const entries = await fetchEntries(username)
  const user = entries.rows[0]
  return ((user.username === username) & (user.password === password))
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