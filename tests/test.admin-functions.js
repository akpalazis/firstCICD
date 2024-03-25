const { expect } = require('expect');
const {fetchQuery,updateUserRole,isRoleValid} = require('../src/admin/admin-tools')

describe('fetchQuery tests', () => {
  it("Valid Username only", async ()=> {
    const entries = await fetchQuery("admin",undefined)
    expect(entries.length).toBeGreaterThan(0)
  });
  it("Valid id only", async ()=> {
    const entries = await fetchQuery(undefined,1)
    expect(entries.length).toBeGreaterThan(0)
  })
  it("Valid Username valid id", async ()=> {
    const entries = await fetchQuery("admin",1)
    expect(entries.length).toBeGreaterThan(0)
  })
  it("Valid Username invalid id", async ()=> {
    const entries = await fetchQuery("admin",2)
    expect(entries.length===0).toBeTruthy()
  })
  it("invalid username valid id", async ()=> {
        const entries = await fetchQuery("admi",1)
    expect(entries.length===0).toBeTruthy()
  })
    it("invalid username invalid id", async ()=> {
    const entries = await fetchQuery("admi",-2)
    expect(entries.length===0).toBeTruthy()
  });
    it("Username id mismatch", async ()=> {
    const entries = await fetchQuery("admin",2)
    expect(entries.length===0).toBeTruthy()
  });
});

describe('updateUserRole tests', () => {
  async function noParamsProvided(username,id,role){
   try {
      await updateUserRole(username,id,role)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message === "No parameters provided for update.")
    }
  }

  async function noRolesProvided(username,id,role){
   try {
      await updateUserRole(username,id,role)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message === "No role provided.")
    }
  }

  async function invalidParamsProvided(username,id,role){
   try {
      await updateUserRole(username,id,role)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message === "Invalid parameters.")
    }
  }

  async function validParamsProvided(username,id,role){
    const old_entry = await fetchQuery(username,id)
    await updateUserRole(username,id,role)
    const new_entry = await fetchQuery(username,id)
    expect(old_entry[0].role===new_entry[0].role).toBeFalsy()
    await updateUserRole(username,id,"admin")
  }

  it("Only one parameter exists", async ()=> {
    const testArray = [
    ["admin",undefined,undefined],
    [undefined,1,undefined],
    [undefined,undefined,"user"],
    ]
    for (const elements of testArray) {
      await noRolesProvided(...elements)
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
      await noParamsProvided(...elements)
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
});

describe("Check role", () =>{
  it("Valid role", async ()=> {
    await isRoleValid("admin")
      .then((response)=>{
        expect(response).toBeTruthy()
        }
      )
  })
  it("Invalid role", async () => {
    await isRoleValid("NO")
      .then((response)=>{
        expect(response).toBeFalsy()
        }
      )
  })
})
