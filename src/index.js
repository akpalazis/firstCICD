const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new Client({ user: 'postgres', host: 'localhost', database: '', password: 'pass', port: '5432'});

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