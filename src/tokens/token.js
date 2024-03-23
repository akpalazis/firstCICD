const express = require('express');
const tokenRouter = express.Router();
const {
  validateServerTokenMiddleware,
  createExpiredTokensMiddleware,
  createTokensMiddleware,
  storeTokenMiddleware,
  deleteTokenMiddleware,
  tokenValidationMiddleware,
  tokenCondition} = require("./token-middleware")

tokenRouter.post('/generateTokens/',
  validateServerTokenMiddleware,
  tokenCondition,
  createTokensMiddleware,
  storeTokenMiddleware,
  async (req, res) => {
    const tokens = res.locals.tokens
    res.locals.tokens = null
    return res.status(200).json({
      message:"Token Generated Successfully",
      tokens:tokens})
});


tokenRouter.post('/generateExpiredAccessTokens/',
  //check the role based on authToken
  //tokenValidationMiddleware(),
  //checkRole
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
  tokenValidationMiddleware,
  createTokensMiddleware,
  storeTokenMiddleware,
  async (req,res) => {
    const tokens = res.locals.tokens
    res.locals.tokens = null
    return res.status(200).json({
      message:"Token is Valid",
      tokens:tokens})
  })

module.exports = {tokenRouter}