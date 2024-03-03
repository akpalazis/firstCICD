const { expect } = require('expect');
const {tokenDatabase} = require('../src/tokens/token-db-tools')
const {createTokensFor} = require("../src/tokens/token-tools")
const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require("../src/constants")
const {delay} = require("./test-tools")

describe('Test createTokensFor', () => {
  it('Generate Valid Token',() => {
    const userId = 1
    const accessTokenTime = '15m'
    const refreshTokenTime = '7d'
    const tokens = createTokensFor(userId,accessTokenTime,refreshTokenTime)
    expect(tokens).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.access,AUTH_SECRET_KEY)).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.refresh,REFRESH_SECRET_KEY)).toBeInstanceOf(Object)
  })
  it('Generate Expired Token',() => {
    const userId = 1
    const accessTokenTime = '-15m'
    const refreshTokenTime = '7d'

    const tokens = createTokensFor(userId,accessTokenTime,refreshTokenTime)
    expect(tokens).toBeInstanceOf(Object)
    const verifyFunction = () => {
        jwt.verify(tokens.access, AUTH_SECRET_KEY);
    };
    expect(verifyFunction).toThrow(Error)
    expect(verifyFunction).toThrow('jwt expired');
  })
})

describe('Test tokenDatabase.storeToken', () => {
  it('Store valid token: expect true',async () => {
    const tokens = createTokensFor(1,'15m','7d')
    const stored = await tokenDatabase.storeToken(tokens.refresh)
    expect(stored).toBeTruthy()
  })
  it('Store invalid token: expect error',async () => {
    const tokens = createTokensFor(1,'15m','-1s')
    const verifyFunction = async () => {
        await tokenDatabase.storeToken(tokens.refresh)
    };
    await expect(verifyFunction).rejects.toThrow(Error)
    await expect(verifyFunction).rejects.toThrow('jwt expired')
  })
  it('Replace token: expect true',async () => {
    await delay(1001)
    const oldToken = await tokenDatabase.fetchRefreshToken(1)
    const tokens = createTokensFor(1,'15m','7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const newToken = await tokenDatabase.fetchRefreshToken(1)
    expect((oldToken.token===newToken.token)).toBeFalsy()
  })

})

