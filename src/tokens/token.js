const express = require('express');
const tokenRouter = express.Router();
const {
  validateServerTokenMiddleware,
  createExpiredTokensMiddleware,
  createTokensMiddleware,
  storeTokenMiddleware,
  deleteTokenMiddleware,
  tokenValidationMiddleware} = require("./token-middleware")

tokenRouter.post('/generateTokens/:userId',
  validateServerTokenMiddleware,
  createTokensMiddleware,
  storeTokenMiddleware,
  async (req, res) => {
    const tokens = res.locals.tokens
    res.locals.tokens = null
    return res.status(200).json({
      message:"Token Generated Successfully",
      tokens:tokens})
});


tokenRouter.post('/generateExpiredAccessTokens/:userID',
  createExpiredTokensMiddleware,
  async (req, res) => {
    return res.status(200).send(res.locals.tokens)
});


tokenRouter.delete('/delete_token/:userId',
  deleteTokenMiddleware,
  async (req, res) => {
    return res.status(200).send("Token Deleted Successfully")
});

tokenRouter.post('/validate-token/',
  validateServerTokenMiddleware,
  tokenValidationMiddleware(),
  async (req,res) => {
    return res.status(200).send("Token is Valid")
  })

module.exports = {tokenRouter}