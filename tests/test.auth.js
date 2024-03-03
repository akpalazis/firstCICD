const request = require('supertest');
const { expect } = require('expect');
const {isJenkins,HOST_URL} = require('../src/constants')
const {validateData} = require('../src/auth-tools')
const {userDatabaseTools} = require('../src/auth-db-tools')
const {connectDB} = require('../src/db');

let app;

if (isJenkins){
  app  = HOST_URL
  connectDB()
} else{
  app = require('../src/app.js');
}
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


describe('Test POST /signup endpoint', () => {
  it("User Created: responds with valid status", ()=> {
    return request(app)
      .post('/signup') // Specify the POST method
      .send({ username: "new_user",password:"test"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe('User Successfully Created') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it("User Already exists: responds with invalid status", ()=> {
    return request(app)
      .post('/signup') // Specify the POST method
      .send({ username: "new_user",password:"test"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('User Already Exists') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
});

describe('Test DELETE /delete endpoint', () => {
  it("No Username: responds with invalid status", ()=> {
    return request(app)
      .delete('/delete')
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe("No User provided") // Check for expected status code
      })
  });
  it("Invalid Username: responds with invalid status", ()=> {
    return request(app)
      .delete('/delete/test_user')
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe("Username not Found") // Check for expected status code
      })
  });

  it("Delete Username: responds with valid status", ()=> {
    return request(app)
      .delete('/delete/new_user')
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe("User Deleted Successfully") // Check for expected status code
      })
  });
});