const { expect } = require('expect');
const {validateData} = require('../src/auth/auth-tools')
const {userDatabaseTools} = require('../src/auth/auth-db-tools')

describe('Test validateData', () => {
  it('No Username and password: responds with error message', async () => {
    try {
      const credentials = {};
      await validateData(credentials);
    } catch (e) {
      expect(e.message).toBe('Username and Password field not found') // Check for expected status code
    }
  })
  it('No Username: responds with error message', async () => {
    try {
      const credentials = {password: "1234"}
      await validateData(credentials)
    } catch (e) {
      expect(e.message).toBe('Username field not found') // Check for expected status code
    }
  });
  it('No Password: responds with error message', async () => {
    try {
      const credentials = {username: "1234"}
      await validateData(credentials)
    } catch (e) {
      expect(e.message).toBe('Password field not found') // Check for expected status code
    }
  });
  it('Empty username and password: responds with error message', async () => {
    try {
      const credentials = {username: "", password: ""}
      await validateData(credentials)
    } catch (e) {
      expect(e.message).toBe('Empty Username and Password Field') // Check for expected status code
    }
  });
  it('Empty username: responds with error message', async () => {
    try {
      const credentials = {username: "", password: "1234"}
      await validateData(credentials)
    } catch (e) {
      expect(e.message).toBe('Empty Username Field')
    }

  });
  it('Empty password: responds with error message', async () => {
    try {
      const credentials = {username: "admin", password: ""}
      await validateData(credentials)
    } catch (e) {
      expect(e.message).toBe('Empty Password Field') // Check for expected status code
    }
  });
  it('Successful Validation: responds with undefined', async () => {
      const credentials = {username: "admin", password: "1234"}
      const validation = await validateData(credentials)
      expect(validation).toBeUndefined()
  });
});

describe('Testing userDatabaseTools.isValidUser', () => {
  it('Login Successful: responds with undefined', async () => {
    const credentials = { username: "admin",password:"pass"}
    const validUser = await userDatabaseTools.isValidUser(credentials)
    expect(validUser).toBeUndefined()
  });
  it('Incorrect Password: responds with error message', async () => {
    try {
      const credentials = {username: "admin", password: "passs"}
      await userDatabaseTools.isValidUser(credentials)
    } catch (e) {
      expect(e.message).toBe("Username does not match with password")
    }
  });
  it('User doesnt exists: responds with error message', async () => {
    try {
      const credentials = {username: "invalid_user", password: "1234"}
      await userDatabaseTools.isValidUser(credentials)
    } catch (e) {
      expect(e.message).toBe('Username not Found')
    }
  });
});

describe('Testing userDatabaseTools.creatUser', () => {
  it("User Created: responds with undefined", async ()=> {
    const credentials = {username: "new_user", password: "test"}
    const userCreated = await userDatabaseTools.createUser(credentials)
    expect(userCreated).toBeUndefined()
  });

});

describe('Testing userDatabaseTools.isUserExists', () => {
  it("User Already exists: responds with error message", async () => {
    try {
      await userDatabaseTools.isUserExists("new_user")
    } catch (e) {
      expect(e.message).toBe('User Already Exists')
    }
  })
  it("Username does not exists: responds with undefined", async () => {
      const canDeleteResponse = await userDatabaseTools.isUserExists('non_existing_user')
      expect(canDeleteResponse).toBeUndefined()
  });
})

describe('Testing userDatabaseTools.canDelete DELETE /delete endpoint', () => {
  it("Invalid Username: responds with error message", async () => {
    try {
      await userDatabaseTools.canDelete('test_user')
    } catch (e) {
      expect(e.message).toBe("Username not Found") // Check for expected status code
    }
  });
  it("Correct Username: responds with undefined", async () => {
      const canDeleteResponse = await userDatabaseTools.canDelete('new_user')
      expect(canDeleteResponse).toBeUndefined()
  });
})

describe('Testing userDatabaseTools.deleteUser DELETE /delete endpoint', () => {
  it("Delete Username: responds with undefined", async ()=> {
    const deleteUserResponse = await userDatabaseTools.deleteUser('new_user')
    expect(deleteUserResponse).toBeUndefined()
  });
});
