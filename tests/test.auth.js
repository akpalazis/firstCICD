const request = require('supertest');
const { expect } = require('expect');
const {isJenkins,HOST_URL} = require('../src/constants')
const {validateData} = require('../src/auth-tools')

let app;

if (isJenkins){
  app  = HOST_URL
} else{
  app = require('../src/app.js');
}
describe('Test validateData', () => {
  it('No Username and password: responds with invalid status code', async () => {
    try {
      const credentials = {};
      await validateData(credentials);
    } catch (e) {
      expect(e.message).toBe('Username and Password field not found') // Check for expected status code
    }
  })
})

describe('Testing POST /validate endpoint', () => {
  it('No Username and password: responds with invalid status code', () => {
    return request(app)
      .post('/validate') // Specify the POST method
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
      .post('/validate') // Specify the POST method
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
      .post('/validate') // Specify the POST method
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
      .post('/validate')
      .send({username:"", password:""})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username and Password Field') // Check for expected status code

      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Empty username: responds with invalid status code', () => {
    return request(app)
      .post('/validate')
      .send({username:"", password:"1234"})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Username Field') // Check for expected status code

      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Empty password: responds with invalid status code', () => {
    return request(app)
      .post('/validate')
      .send({username:"admin", password:""})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(400); // Check for expected status code
        expect(response.text).toBe('Empty Password Field') // Check for expected status code

      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Successful Validation: responds with valid status code', () => {
    return request(app)
      .post('/validate')
      .send({username:"admin", password:"1234"})// Specify the POST method
      .then((response) => {
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Valid User') // Check for expected status code

      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
});

describe('Testing POST /login endpoint', () => {
  it('Login Successful: responds with valid status code', () => {
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