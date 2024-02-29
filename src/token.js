const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

// Secret keys for access and refresh tokens
const accessSecretKey = 'access-secret-key';
const refreshSecretKey = 'refresh-secret-key';

router.post('/generateTokens/:user', async (req, res) => {
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

router.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});

module.exports = router