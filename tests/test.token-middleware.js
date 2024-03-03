const { expect } = require('expect');
const {tokenDatabase} = require("../src/tokens/token-db-tools")
const {createTokensMiddleware,storeTokenMiddleware,tokenValidationMiddleware} = require("../src/tokens/token-middleware")
const sinon = require('sinon');
const {createTokensFor} = require("../src/tokens/token-tools")
const jwt = require('jsonwebtoken');
const {AUTH_SECRET_KEY,REFRESH_SECRET_KEY} = require("../src/constants")

const {delay} = require("./test-tools")

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
   after( async ()=>{
   await tokenDatabase.deleteToken(1)
 })

})

describe('Test tokenValidationMiddleware', () => {
  // TODO: ADD checks that the token is rotated as soon as the functionality is added!!!
  it('Test valid AccessToken valid RefreshToken: Expected next call and new tokens', async () => {
    const tokens = createTokensFor(1, '15m', '7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const req = {
      headers:{
        authorization:`Bearer accessToken=${tokens.access};, Bearer refreshToken=${tokens.refresh};`
      }
    }
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,{},next)
    expect(next.calledOnce).toBeTruthy()
  })
  it('Test expired AccessToken valid RefreshToken single used: Expected status 200 and new tokens', async () => {
    const tokens = createTokensFor(1, '-1m', '7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const req = {
      headers:{
        authorization:`Bearer accessToken=${tokens.access};, Bearer refreshToken=${tokens.refresh};`
      }
    }
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(200)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Unauthorized - Generating new tokens')
      },
    };
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,res,next)
    expect(next.calledOnce).toBeFalsy()
  })
  it('Test expired AccessToken valid RefreshToken already used: Expected status 400', async () => {
    const tokens = createTokensFor(1, '-1m', '7d')
    await tokenDatabase.storeToken(tokens.refresh)
    await delay(1001)
    const new_tokens = createTokensFor(1, '-1m', '7d')
    const req = {
      headers:{
        authorization:`Bearer accessToken=${new_tokens.access};, Bearer refreshToken=${new_tokens.refresh};`
      }
    }
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Unauthorized - Reload Token already used')
      },
    };
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,res,next)
    expect(next.calledOnce).toBeFalsy()
  })
  it('Test expired AccessToken expired RefreshToken: Expected status 400', async () => {
    const tokens = createTokensFor(1, '-1m', '1s') // cannot save expired tokens
    await tokenDatabase.storeToken(tokens.refresh)
    await delay(1001) // wait for the refresh token to expire
    const req = {
      headers:{
        authorization:`Bearer accessToken=${tokens.access};, Bearer refreshToken=${tokens.refresh};`
      }
    }
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Unauthorized - Refresh Token Expired')
      },
    };
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,res,next)
    expect(next.calledOnce).toBeFalsy()
  })
  it('Test expired AccessToken expired RefreshToken: Expected status 400', async () => {
    const tokens = createTokensFor(1, '-1m', '7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const req = {
      headers:{
        authorization:`Bearer accessToken=${tokens.access};, Bearer refreshToken=invalid_token;`
      }
    }
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Unauthorized - Invalid Refresh Token')
      },
    };
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,res,next)
    expect(next.calledOnce).toBeFalsy()
  })
  it('Test invalid AccessToken: Expected status 400', async () => {
    const tokens = createTokensFor(1, '15m', '7d')
    await tokenDatabase.storeToken(tokens.refresh)
    const req = {
      headers:{
        authorization:`Bearer accessToken=xxxxx;, Bearer refreshToken=${tokens.refresh};`
      }
    }
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe(`Unauthorized - JWT MALFORMED`)
      },
    };
    const next = sinon.spy()
    await tokenValidationMiddleware()(req,res,next)
    expect(next.calledOnce).toBeFalsy()
  })

})
// token validation middleware !!!!
// invalid expired auth
