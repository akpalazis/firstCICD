const { expect } = require('expect');
const {isJenkins,HOST_URL} = require('../src/constants')
const {connectDB} = require('../src/db');
const {tokenDatabase} = require("../src/tokens/token-db-tools")
const {createTokensMiddleware,storeTokenMiddleware} = require("../src/tokens/token-middleware")
const sinon = require('sinon');
const {createTokensFor} = require("../src/tokens/token-tools")
const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require("../src/constants")

let app;

if (isJenkins){
  app  = HOST_URL
  connectDB()
} else{
  app = require('../src/app.js');
}
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


/*

function storeTokenMiddleware(req,res,next){


function deleteTokenMiddleware(req,res,next){
 */

describe('Test createTokensMiddleware', () => {
  it('Generate Valid Token', async () => {
    const req = {params:{userId:1},body:{}}
    const res = {
      locals:{}
    };
    const next = sinon.spy()
    await createTokensMiddleware(req,res,next)
    expect(next.calledOnce).toBeTruthy()
    const tokens = res.locals.tokens
    expect(tokens).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.access,AUTH_SECRET_KEY)).toBeInstanceOf(Object)
    expect(jwt.verify(tokens.refresh,REFRESH_SECRET_KEY)).toBeInstanceOf(Object)

  })
  it('Generate Expired Token',async () => {
    const req = {params:{userId:1},body:{accessTime:'-1s'}}
    const res = {
      locals:{}
    };
    const next = sinon.spy()
    await createTokensMiddleware(req,res,next)
    const tokens = res.locals.tokens
    expect(tokens).toBeInstanceOf(Object)
    const verifyFunction = () => {
        jwt.verify(tokens.access, AUTH_SECRET_KEY);
    };
    expect(verifyFunction).toThrow(Error)
    expect(verifyFunction).toThrow('jwt expired');
  })
})

describe('Test storeTokenMiddleware', () => {
  it('Store valid token', async () => {
    const tokens = createTokensFor(1, '15m', '7d')
    const cookie = sinon.spy()
    const res = {
      locals: {tokens: tokens},
      cookie: cookie,
    };
    const next = sinon.spy()
    await storeTokenMiddleware({}, res, next)
    expect(next.calledOnce).toBeTruthy()
    expect(cookie.calledTwice).toBeTruthy()
    const firstCallArgs = cookie.firstCall.args
    expect(firstCallArgs[0]).toBe("accessToken")
    expect(firstCallArgs[1]).toBe(tokens.access)
    expect(firstCallArgs[2]).toBeInstanceOf(Object)
    const secondCallArgs = cookie.secondCall.args
    expect(secondCallArgs[0]).toBe("refreshToken")
    expect(secondCallArgs[1]).toBe(tokens.refresh)
    expect(secondCallArgs[2]).toBeInstanceOf(Object)
  })
  it('Store invalid token', async () => {
    const tokens = createTokensFor(1, '15m', '-1s')
    const cookie = sinon.spy()
    const res = {
      locals: {tokens: tokens},
      cookie: cookie,
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe("jwt expired");
      }
    };
    const next = sinon.spy()
    await storeTokenMiddleware({}, res, next)
  })
  it('Replace token: expect true',async () => {
    await delay(1001)
    const oldToken = await tokenDatabase.fetchRefreshToken(1)
    const tokens = createTokensFor(1, '15m', '7d')
    const cookie = sinon.spy()
    const res = {
      locals: {tokens: tokens},
      cookie: cookie,
    };
    const next = sinon.spy()
    await storeTokenMiddleware({}, res, next)
    const newToken = await tokenDatabase.fetchRefreshToken(1)
    expect((oldToken.token===newToken.token)).toBeFalsy()
  })
})

