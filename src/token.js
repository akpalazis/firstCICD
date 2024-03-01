const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const {storeRefreshToken, deleteToken} = require('./db')
require('dotenv').config();

// Secret keys for access and refresh tokens
const accessSecretKey = process.env.AUTH_SECRET_KEY
const refreshSecretKey = process.env.REFRESH_SECRET_KEY
console.log(accessSecretKey)
console.log(refreshSecretKey)
const storeTokens = async (res,accessToken,refreshToken) =>
{
  try {
    res.cookie('accessToken', accessToken, {httpOnly: true, secure: false, sameSite: 'strict'});
    res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: false, sameSite: 'strict'});
    await storeRefreshToken(refreshToken)
  } catch (e) {
    throw new Error(e)
  }
}

router.post('/generateTokens/:userID', async (req, res) => {
  try {
    const userID = req.params.userID
    const accessToken = jwt.sign({ userId:userID }, accessSecretKey, { expiresIn: '1s' });
    const refreshToken = jwt.sign({ userId: userID }, refreshSecretKey, {expiresIn: '7d'});
    await storeTokens(res,accessToken,refreshToken)
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

router.delete('/delete_token/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    await deleteToken(userId)
    return res.status(200).send("Token Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

module.exports = router