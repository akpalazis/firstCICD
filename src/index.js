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


app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    if (username) {
      if (await isUsernameExists(username)) {
        res.status(200).send('Login Successful');
      }
      res.status(400).send("Username not Found")
    }
    res.status(400).send('Empty Username Field')
  } catch (err) {
    res.status(400).send(err.message);
  }
});


app.post('/signup', async (req, res) => {
  try {
    const username = req.body.username
    if (username) {
      if (await isUsernameExists(username)) {
        res.status(400).send('User Already Exists');
      }
      res.status(200).send("User Successfully Created")
    }
    res.status(400).send('Empty Username Field')
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const isUsernameExists = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1'
  // Execute the query
  const dbResult = await db.query(query, [username])
  return dbResult.rows.length > 0;
}

const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address