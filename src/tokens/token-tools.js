const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require('../constants')
const {tokenDatabase} = require("./token-db-tools")

function createTokensFor(userId,accessTokenTime,refreshTokenTime){
    const accessToken = jwt.sign({ userId:userId }, AUTH_SECRET_KEY, { expiresIn: accessTokenTime });
    const refreshToken = jwt.sign({ userId: userId }, REFRESH_SECRET_KEY, {expiresIn: refreshTokenTime});
    return {access:accessToken,
            refresh:refreshToken}
}

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


module.exports = {createTokensFor,storeTokens}