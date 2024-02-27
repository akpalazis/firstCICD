const request = require('supertest');
const { expect } = require('expect');

const isJenkins = process.env.JENKINS === 'true';


let app;

if (isJenkins){
  app  = "http://localhost:3000"
} else{
  app = require('../src/index.js');
}


describe('Testing POST /login endpoint', () => {
  it('User Exists: responds with valid status code', () => {
    return request(app)
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
        expect(response.text).toBe('Username does not match with password') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('User doesnt exists: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({ username: "invalid_user" , password: "1234"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Username not Found') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('No Username and password: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Username and Password field not found') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
});
  it('No Username: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({password: "1234"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Username field not found') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('No Password: responds with invalid status code', () => {
    return request(app)
      .post('/login') // Specify the POST method
      .send({username: "1234"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Password field not found') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Empty username and password: responds with invalid status code', () => {
    return request(app)
      .post('/login')
      .send({username:"", password:""})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username and Password Field') // Check for expected status code

      })
      .catch((err) => {
        console.log(err)
        return done(err); // Handle potential errors
      });
  });
  it('Empty username: responds with invalid status code', () => {
    return request(app)
      .post('/login')
      .send({username:"", password:"1234"})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username Field') // Check for expected status code

      })
      .catch((err) => {
        console.log(err)
        return done(err); // Handle potential errors
      });
  });
  it('Empty password: responds with invalid status code', () => {
    return request(app)
      .post('/login')
      .send({username:"admin", password:""})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Password Field') // Check for expected status code

      })
      .catch((err) => {
        console.log(err)
        return done(err); // Handle potential errors
      });
  });
  // empty password
  // no password
  // empty both username and password
});

describe('Test POST /signup endpoint', () => {
  it("Empty Username: responds with invalid status", ()=> {
    return request(app)
      .post('/signup')
      .send({password:"1234"})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Username field not found') // Check for expected status code
      })
  });
  it("No Username: responds with invalid status", ()=> {
    return request(app)
      .post('/signup')
      .send({username:'', password:"1234"})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Empty Username Field') // Check for expected status code
      })
  });
  it("User Already exists: responds with invalid status", ()=> {
    return request(app)
      .post('/signup') // Specify the POST method
      .send({ username: "admin",password:"1234"}) // Attach username and password in the request body
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
      .send({ username: "new_user",password:"test"}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe('User Successfully Created') // Check for expected status code
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
});