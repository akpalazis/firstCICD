const { expect } = require('expect');
const sinon = require('sinon');
const {userQueryMiddleware} = require("../src/admin/admin-middleware")

describe('userQueryMiddleware tests', () => {
  it("Valid Username only", async ()=> {
    const req = {
      query: {
        username:"admin"
      }
    }
    const next = sinon.spy()
    const res = {
      locals:{
        entries:undefined
      }
    };
    await userQueryMiddleware(req, res, next)
    expect(next.calledOnce).toBeTruthy()
    expect(res.locals.entries.length).toBeGreaterThan(0)
  });
  it("Valid id only", async ()=> {
    const req = {
      query: {
        id:1
      }
    }
    const next = sinon.spy()
    const res = {
      locals:{
        entries:undefined
      }
    };
    await userQueryMiddleware(req, res, next)
    expect(next.calledOnce).toBeTruthy()
    expect(res.locals.entries.length).toBeGreaterThan(0)
  });
  it("Valid Username valid id", async ()=> {
    const req = {
      query: {
        username:"admin",
        id:1
      }
    }
    const next = sinon.spy()
    const res = {
      locals:{
        entries:undefined
      }
    };
    await userQueryMiddleware(req, res, next)
    expect(next.calledOnce).toBeTruthy()
    expect(res.locals.entries.length).toBeGreaterThan(0)
  });
  it("Valid Username invalid id", async ()=> {
    const req = {
      query: {
        username:"admin",
        id:2
      }
    }
    const next = sinon.spy()
    const res = {
      locals: {},
      entries: undefined,
        status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Query not Valid')
      }
    };
    await userQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
    expect(res.locals.entries.length===0).toBeTruthy()

  });
  it("Invalid Username valid id", async ()=> {
    const req = {
      query: {
        username:"adin",
        id:2
      }
    }
    const next = sinon.spy()
    const res = {
      locals: {},
      entries: undefined,
        status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Query not Valid')
      }
      }
    await userQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
    expect(res.locals.entries.length===0).toBeTruthy()

  });
  it("Invalid Username Invalid id", async ()=> {
    const req = {
      query: {
        username:"amin",
        id:2
      }
    }
    const next = sinon.spy()
    const res = {
      locals: {},
      entries: undefined,
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Query not Valid')

      }
    };
    await userQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
    expect(res.locals.entries.length===0).toBeTruthy()

  })

});
