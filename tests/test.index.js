const request = require('supertest');
const { expect } = require('expect');

const isJenkins = process.env.JENKINS === 'true';

if (isJenkins){
  const app  = "http://localhost:3000"
} else{
  const app = require('../src/index.js');
}


describe('Testing POST /login endpoint', () => {
  it('User Exists: responds with valid status code', async () => {
    return await request(app)
      .post('/login') // Specify the POST method
      .send({ username: "admin",password:"pass"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe('Login Successful') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Incorrect Password: responds with valid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({ username: "admin",password:"passs"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Wrong Password') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('User doesnt exists: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({ username: "invalid_user"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Username not Found') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Empty Username: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({ username: ""}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username Field') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('No username: responds with invalid status code', () => {
    return request(app)
      .post('/login')
      .send("")// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username Field') // Check for expected status code

      })
      .catch((err) => {
        console.log(err)
        return done(err); // Handle potential errors
      });
  });
});

describe('Test POST /signup endpoint', () => {
  it("Empty Username: responds with invalid status", ()=> {
    return request(app)
      .post('/signup')
      .send("")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Empty Username Field') // Check for expected status code
      })
  });
  it("No Username: responds with invalid status", ()=> {
    return request(app)
      .post('/signup')
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Empty Username Field') // Check for expected status code
      })
  });
  it("User Already exists: responds with invalid status", ()=> {
    return request(app)
      .post('/signup') // Specify the POST method
      .send({ username: "admin"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('User Already Exists') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it("User Created: responds with valid status", ()=> {
    return request(app)
      .post('/signup') // Specify the POST method
      .send({ username: "new_user"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe('User Successfully Created') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
});