const { expect } = require('expect');
const {tokenDatabase} = require('../src/tokens/token-db-tools')
const {createTokensFor,stripToken,isTokenValid,checkTokenSingleUse} = require("../src/tokens/token-tools")
const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require("../src/constants")
const {delay} = require("./test-tools")

describe('Test createTokensFor', () => {
  it('Generate Valid Token',() => {
    const userData = {userId:1,role:"admin"}
    const accessTokenTime = '15m'
    const refreshTokenTime = '7d'
    const tokens = createTokensFor(userData,accessTokenTime,refreshTokenTime)
    expect(tokens).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.access,AUTH_SECRET_KEY)).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.refresh,REFRESH_SECRET_KEY)).toBeInstanceOf(Object)
  })
  it('Generate Expired Token',() => {
    const userData = {userId:1,role:"admin"}
    const accessTokenTime = '-15m'
    const refreshTokenTime = '7d'

    const tokens = createTokensFor(userData,accessTokenTime,refreshTokenTime)
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
    const userData = {userId:1,role:"admin"}
    const tokens = createTokensFor(userData,'15m','7d')
    const stored = await tokenDatabase.storeToken(tokens.refresh)
    expect(stored).toBeTruthy()
  })
  it('Store invalid token: expect error',async () => {
    const userData = {userId:1,role:"admin"}
    const tokens = createTokensFor(userData,'15m','-1s')
    const verifyFunction = async () => {
        await tokenDatabase.storeToken(tokens.refresh)
    };
    await expect(verifyFunction).rejects.toThrow(Error)
    await expect(verifyFunction).rejects.toThrow('jwt expired')
  })
  it('Replace token: expect true',async () => {
    await delay(1001)
    const oldToken = await tokenDatabase.fetchRefreshToken(1)
    const userData = {userId:1,role:"admin"}
    const tokens = createTokensFor(userData,'15m','7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const newToken = await tokenDatabase.fetchRefreshToken(1)
    expect((oldToken.token===newToken.token)).toBeFalsy()
  })

})

describe('Test strip token',()=>{
  let tokens
  before(()=>{
    const userData = {userId:1,role:"admin"}
    tokens = createTokensFor(userData,"1m","7d")
  })
  it("check with name token",() =>{
    const stringToStrip = `Bearer ${tokens.access}, Bearer ${tokens.refresh}`
    const [accessTokenCookie, refreshTokenCookie] = stringToStrip.split(',');
    const accessToken = stripToken(accessTokenCookie)
    const refreshToken = stripToken(refreshTokenCookie)
    expect(accessToken).toBe(tokens.access)
    expect(refreshToken).toBe(tokens.refresh)
  })
  it("check without name token",() =>{
    const stringToStrip = `Bearer accessToken=${tokens.access};, Bearer refreshToken=${tokens.refresh};`
    const [accessTokenCookie, refreshTokenCookie] = stringToStrip.split(',');
    const accessToken = stripToken(accessTokenCookie)
    const refreshToken = stripToken(refreshTokenCookie)
    expect(accessToken).toBe(tokens.access)
    expect(refreshToken).toBe(tokens.refresh)
  })
 after( async ()=>{
   await tokenDatabase.deleteToken(1)
 })
})

describe("Test isTokenValid", ()=>{
  it('Test valid token: expect is valid true is expired false and token info', () =>{
    const userData = {userId:1,role:"admin"}
    const tokens = createTokensFor(userData,"1m","7d")
    const authTokenData = isTokenValid(tokens.access,AUTH_SECRET_KEY)
    expect(authTokenData.isValid).toBeTruthy()
    expect(authTokenData.isExpired).toBeFalsy()
    expect(authTokenData.decodedToken).toBeInstanceOf(Object)
    expect(authTokenData.token).toBe(tokens.access)
    const refreshTokenData = isTokenValid(tokens.refresh,REFRESH_SECRET_KEY)
    expect(refreshTokenData.isValid).toBeTruthy()
    expect(refreshTokenData.isExpired).toBeFalsy()
    expect(refreshTokenData.decodedToken).toBeInstanceOf(Object)
    expect(refreshTokenData.token).toBe(tokens.refresh)
  })

  it('Test valid token but expired: expect is valid true is expired true', () =>{
    const userData = {userId:1,role:"admin"}
    const tokens = createTokensFor(userData,"-1s","-1s")
    const authTokenData = isTokenValid(tokens.access,AUTH_SECRET_KEY)
    expect(authTokenData.isValid).toBeTruthy()
    expect(authTokenData.isExpired).toBeTruthy()
    const refreshTokenData = isTokenValid(tokens.refresh,REFRESH_SECRET_KEY)
    expect(refreshTokenData.isValid).toBeTruthy()
    expect(refreshTokenData.isExpired).toBeTruthy()
  })
  it('Test invalid token: expect is valid false is expired false', () =>{
    const authTokenData = isTokenValid('invalid token',AUTH_SECRET_KEY)
    expect(authTokenData.isValid).toBeFalsy()
    const refreshTokenData = isTokenValid('invalid token',REFRESH_SECRET_KEY)
    expect(refreshTokenData.isValid).toBeFalsy()
  })
   after( async ()=>{
   await tokenDatabase.deleteToken(1)
 })
})

describe("Test checkTokenSingleUse", () =>{
  let tokens
  before(async ()=>{
    const userData = {userId:1,role:"admin"}
    tokens = createTokensFor(userData,"15m","7d")
    await tokenDatabase.storeToken(tokens.refresh)
  })
  it("Test Single use token", async () => {
    const tokenData = isTokenValid(tokens.refresh,REFRESH_SECRET_KEY)
    const isSingle = await checkTokenSingleUse(tokenData)
    expect(isSingle).toBeTruthy()
  })
  it("Test used token", async () => {
    await delay(1001)
    const userData = {userId:1,role:"admin"}
    const new_token = createTokensFor(userData,"15m","7d")
    await tokenDatabase.storeToken(new_token.refresh)
    const tokenData = isTokenValid(tokens.refresh,REFRESH_SECRET_KEY)
    const isSingle = await checkTokenSingleUse(tokenData)
    expect(isSingle).toBeFalsy()
  })
  after( async ()=>{
   await tokenDatabase.deleteToken(1)
 })
})