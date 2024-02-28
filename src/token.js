const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
// Secret keys for access and refresh tokens
const accessSecretKey = 'access-secret-key';
const refreshSecretKey = 'refresh-secret-key';

app.post('/generateTokens/:user', async (req, res) => {
  try {
    const username = req.params.user
    const accessToken = jwt.sign({ username:username }, accessSecretKey, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, sameSite: 'strict' });
    const refreshToken = jwt.sign({ username: username }, refreshSecretKey);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict' });

    return res.status(200).send("Token Generated Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

app.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});


const port = process.env.PORT || 3001;
const address = app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

module.exports = address