const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    if (username) {
      if (isUsernameExists(username)) {
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
      if (isUsernameExists(username)) {
        res.status(400).send('User Already Exists');
      }
      res.status(200).send("User Successfully Created")
    }
    res.status(400).send('Empty Username Field')
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const isUsernameExists = (username) => {
  //TODO: write the function to check if username is in postgresql database
  return username === "admin";
}

const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address