const jwt = require('jsonwebtoken');
const express = require('express');
const tokenRouter = express.Router();
const {tokenDatabase} = require('./db')
require('dotenv').config();

// Secret keys for access and refresh tokens
const accessSecretKey = process.env.AUTH_SECRET_KEY
const refreshSecretKey = process.env.REFRESH_SECRET_KEY

const storeTokens = async (res,accessToken,refreshToken) =>
{
  try {
    res.cookie('accessToken', accessToken, {httpOnly: true, secure: false, sameSite: 'strict'});
    res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: false, sameSite: 'strict'});
    await tokenDatabase.storeToken(refreshToken)
  } catch (e) {
    throw new Error(e)
  }
}

const createTokensFor =  (userId,accessTokenTime,refreshTokenTime) => {
    const accessToken = jwt.sign({ userId:userId }, accessSecretKey, { expiresIn: accessTokenTime });
    const refreshToken = jwt.sign({ userId: userId }, refreshSecretKey, {expiresIn: refreshTokenTime});
    return {access:accessToken,
            refresh:refreshToken}
}

tokenRouter.post('/generateTokens/:userID', async (req, res) => {
  try {
    const userID = req.params.userID
    const tokens = await createTokensFor(userID,"15m","7d")
    const accessToken = tokens.access
    const refreshToken = tokens.refresh
    await storeTokens(res,accessToken,refreshToken)
    return res.status(200).send("Token Generated Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

tokenRouter.post("/fetchToken", async (req,res) => {
  const userId = req.body.userId
  const accessTime = req.body.accessTime
  const refreshTime = req.body.refreshTime
  const tokens = await createTokensFor(userId,accessTime,refreshTime)
  return res.status(200).json(tokens)
})

tokenRouter.post('/saveToken',async (req, res) => {
  try{
    const accessToken = req.body.access
    const refreshToken = req.body.refresh
    await storeTokens(res,accessToken,refreshToken)
    return res.status(200).send("Token Generated Successfully")
  } catch (e) {
    return res.status(400).send(err.message);
  }
})


tokenRouter.post('/generateExpiredAccessTokens/:userID', async (req, res) => {
  try {
    const userID = req.params.userID
    const tokens = await createTokensFor(userID,"-1m","7d")
    const accessToken = tokens.access
    const refreshToken = tokens.refresh
    await storeTokens(res,accessToken,refreshToken)
    return res.status(200).send("Token Generated Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

tokenRouter.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});

tokenRouter.delete('/delete_token/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    await tokenDatabase.deleteToken(userId)
    return res.status(200).send("Token Deleted Successfully")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});



module.exports = {tokenRouter,createTokensFor}