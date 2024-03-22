const { expect } = require('expect');
const sinon = require('sinon');
const {userQueryMiddleware,updateRoleQueryMiddleware} = require("../src/admin/admin-middleware")
const {fetchQuery,updateUserRole} = require("../src/admin/admin-tools")

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


describe('updateRoleQueryMiddleware tests', () => {
  async function noParamsProvided(username,id,role){
    const req = {
      query: {
        username: username,
        id:id,
        role:role
      }
    }
    const next = sinon.spy()
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('No parameters provided for update.')
      }
    };
    await updateRoleQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
  }

  async function noRolesProvided(username,id,role){
   const req = {
      query: {
        username: username,
        id:id,
        role:role
      }
    }
    const next = sinon.spy()
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('No role provided.')

      }
    };
    await updateRoleQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
  }

  async function invalidParamsProvided(username,id,role){
   const req = {
      query: {
        username: username,
        id:id,
        role:role
      }
    }
    const next = sinon.spy()
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Invalid parameters.')

      }
    };
    await updateRoleQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
  }

  async function validParamsProvided(username,id,role){
    const old_entry = await fetchQuery(username,id)
    const req = {
      query: {
        username: username,
        id:id,
        role:role
      }
    }
    const next = sinon.spy()
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(200)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Role updated successfully.')

      }
    };
    await updateRoleQueryMiddleware(req, res, next)
    expect(next.calledOnce).toBeTruthy()
    const new_entry = await fetchQuery(username,id)
    expect(old_entry[0].role===new_entry[0].role).toBeFalsy()
    await updateUserRole(username,id,"admin")
  }

  it("No parameter exists", async ()=> {
    const testArray = [
    [undefined,undefined,"user"],
    ]
    for (const elements of testArray) {
      await noParamsProvided(...elements)
    }
  });

  it("No role exists", async ()=> {
    const testArray = [
    ["admin",1,undefined],
    ["admin",2,undefined],
    ["admin",-123,undefined],
    ["ad",1,undefined],
    ["ad",-231,undefined],
    ]
    for (const elements of testArray) {
      await noRolesProvided(...elements)
    }
  })

  it("Role exists but invalid params", async ()=> {
    const testArray = [
    ["admin",2,"user"],
    ["admin",-123,"user"],
    ["ad",1,"user"],
    ["ad",-231,"user"],
    ]
    for (const elements of testArray) {
      await invalidParamsProvided(...elements)
    }
  })

  it("Valid Params", async ()=> {
    const testArray = [
    ["admin",1,"user"],
    ["admin",undefined,"user"],
    [undefined,1,"user"],
    ]
    for (const elements of testArray) {
      await validParamsProvided(...elements)
    }
  })

  it("invalid role", async ()=> {
    const req = {
      query: {
        username: "admin",
        id:1,
        role:"NO"
      }
    }
    const next = sinon.spy()
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(400)
        return res;
      },
      send: (data) => {
        expect(data).toBe('Role is not valid.')
      }
    };
    await updateRoleQueryMiddleware(req, res, next)
    expect(next.notCalled).toBeTruthy()
  })
});


