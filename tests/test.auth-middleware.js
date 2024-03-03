const { expect } = require('expect');
const sinon = require('sinon');
const {dataValidationMiddleware} = require("../src/auth/auth-middleware")

async function mainTest(testParams){
  const req = {body: testParams.credentialsToCheck}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(testParams.expectedStatusCode);
        return res;
      },
      send: (data) => {
        expect(data).toBe(testParams.expectedMessage);
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(testParams.nextCalled)
}

describe('Test dataValidationMiddleware', () => {
  it('No Username and password: responds with error message', async () => {
  const testParams = {
    credentialsToCheck:{},
    expectedStatusCode:400,
    expectedMessage:'Username and Password field not found',
    nextCalled:false
  }
  await mainTest(testParams)
  })

  it('No Username: responds with error message', async () => {
    const testParams = {
    credentialsToCheck:{password:1234},
    expectedStatusCode:400,
    expectedMessage:'Username field not found',
    nextCalled:false
    }
    await mainTest(testParams)
  })
  it('No Password: responds with error message', async () => {
    const testParams = {
    credentialsToCheck:{username:1234},
    expectedStatusCode:400,
    expectedMessage:'Password field not found',
    nextCalled:false
    }
    await mainTest(testParams)
  })
  it('Empty username and password: responds with error message', async () => {
    const testParams = {
    credentialsToCheck:{username:"",password:""},
    expectedStatusCode:400,
    expectedMessage:'Empty Username and Password Field',
    nextCalled:false
    }
    await mainTest(testParams)
  })

  it('Empty username: responds with error message', async () => {
    const testParams = {
    credentialsToCheck:{username:"",password:"password"},
    expectedStatusCode:400,
    expectedMessage:'Empty Username Field',
    nextCalled:false
    }
    await mainTest(testParams)
  })

  it('Empty password: responds with error message', async () => {
    const testParams = {
    credentialsToCheck:{username:"admin",password:""},
    expectedStatusCode:400,
    expectedMessage:'Empty Password Field',
    nextCalled:false
    }
    await mainTest(testParams)
  })

  it('Successful Validation: responds with undefined', async () => {
    const req = {body: {username:"username",password:"password"}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBeUndefined()
        return res;
      },
      send: (data) => {
        expect(data).toBeUndefined()
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(true)
  })
})