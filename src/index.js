const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    console.log(username)
    if (username) {
      if (username !== "") {
        // TODO: Check for username in db return successful 200 or Username not found 404
        res.status(200).send('Login Successful');
      }
    } else {
        throw new Error("Empty Username Field")
      }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address