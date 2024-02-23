const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    console.log(username)
    if (username) {
      res.status(200).send('Login Successful');
    }
    res.status(400).send('Empty Username Field')
  } catch (err) {
    res.status(400).send(err.message);
  }
});


const port = process.env.PORT || 3000;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address