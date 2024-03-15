const express = require('express');
const tokenRouter = express.Router();
const {createTokensMiddleware,storeTokenMiddleware,manipulateToken,deleteTokenMiddleware,tokenValidationMiddleware} = require("./token-middleware")

tokenRouter.post('/generateTokens/:userId',
  createTokensMiddleware,
  storeTokenMiddleware, async (req, res) => {
    const tokens = res.locals.tokens
    res.locals.tokens = null
    return res.status(200).json({
      message:"Token Generated Successfully",
      tokens:tokens})
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



tokenRouter.delete('/delete_token/:userId',
  deleteTokenMiddleware,
  async (req, res) => {
    return res.status(200).send("Token Deleted Successfully")
});

tokenRouter.post('/validate-token/',
  tokenValidationMiddleware(),
  async (req,res) => {
    //TODO: Find a way to recognise if we regenerated a new token or if its the same if new it needs to store on the auth
    return res.status(200).send("Token is Valid")
  })

module.exports = {tokenRouter}