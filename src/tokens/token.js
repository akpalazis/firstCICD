const express = require('express');
const tokenRouter = express.Router();
const {createTokensMiddleware,storeTokenMiddleware,manipulateToken,deleteTokenMiddleware} = require("./token-middleware")
// Secret keys for access and refresh tokens


tokenRouter.post('/generateTokens/:userId',
  createTokensMiddleware,
  storeTokenMiddleware, async (req, res) => {
  return res.status(200).send("Token Generated Successfully")
});

tokenRouter.post("/fetchToken/:userId",createTokensMiddleware, async (req,res) => {
  return res.status(200).json(res.locals.tokens)
})

tokenRouter.post('/saveToken',
  manipulateToken,
  storeTokenMiddleware,async (req, res) => {
  return res.status(200).send("Token Generated Successfully")
})


tokenRouter.post('/generateExpiredAccessTokens/:userID',
  createTokensMiddleware,
  storeTokenMiddleware,
  async (req, res) => {
    return res.status(200).send("Token Generated Successfully")
});

tokenRouter.get('/clearCookies', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  return res.status(200).send("Cookies Cleared Successfully");
});

tokenRouter.delete('/delete_token/:userId',
  deleteTokenMiddleware,
  async (req, res) => {
    return res.status(200).send("Token Deleted Successfully")
});



module.exports = {tokenRouter}