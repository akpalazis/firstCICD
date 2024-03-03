const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require('../constants')

function createTokensFor(userId,accessTokenTime,refreshTokenTime){
    const accessToken = jwt.sign({ userId:userId }, AUTH_SECRET_KEY, { expiresIn: accessTokenTime });
    const refreshToken = jwt.sign({ userId: userId }, REFRESH_SECRET_KEY, {expiresIn: refreshTokenTime});
    return {access:accessToken,
            refresh:refreshToken}
}

module.exports = {createTokensFor}