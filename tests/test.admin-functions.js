const { expect } = require('expect');
const {fetchQuery} = require('../src/admin/admin-tools')

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
    const entries = await fetchQuery("admi",2)
    expect(entries.length===0).toBeTruthy()
  });
});
