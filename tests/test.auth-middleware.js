const { expect } = require('expect');
const {isJenkins,HOST_URL} = require('../src/constants')
const {connectDB} = require('../src/db');
const sinon = require('sinon');
const {dataValidationMiddleware} = require("../src/auth-middleware")

let app;

if (isJenkins){
  app  = HOST_URL
  connectDB()
} else{
  app = require('../src/app.js');
}

describe('Test dataValidationMiddleware', () => {
  it('No Username and password: responds with error message', async () => {
    const req = {body: {}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Username and Password field not found');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
  })
  it('No Username: responds with error message', async () => {
    const req = {body: {password:1234}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Username field not found');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
  })
  it('No Password: responds with error message', async () => {
    const req = {body: {username:1234}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Password field not found');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
  })
  it('Empty username and password: responds with error message', async () => {
    const req = {body: {username:"",password:""}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Empty Username and Password Field');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
  })

  it('Empty username: responds with error message', async () => {
    const req = {body: {username:"",password:"password"}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Empty Username Field');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
  })

  it('Empty password: responds with error message', async () => {
    const req = {body: {username:"admin",password:""}}
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400);
        return res;
      },
      send: (data) => {
        expect(data).toBe('Empty Password Field');
      },
    };
    const next = sinon.spy()
    await dataValidationMiddleware(req,res,next)
    expect(next.calledOnce).toBe(false)
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