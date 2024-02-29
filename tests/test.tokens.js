const { expect } = require('expect');
const request = require('supertest');


const isJenkins = process.env.JENKINS === 'true';


let app;

if (isJenkins){
  app  = "http://localhost:3000"
} else{
  app = require('../src/app.js');
}


describe('Testing POST /generateTokens endpoint', () => {
  it('No JWT: responds with invalid status code',() =>{
    return request(app)
      .get("/")
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - JWT is missing')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Invalid JWT: responds with invalid status code',() =>{
    return request(app)
      .get("/")
      .set('Authorization', `Bearer xxxx`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Invalid JWT')
      })
      .catch((err)=>{
        return done(err)
      })
  })


  it('validate that cookies are stored', () => {
    return request(app)
      .post('/generateTokens/1') // Specify the POST method
      .send({}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Token Generated Successfully') // Check for expected status code
        // Check that cookies are set in the response
        expect(response.headers['set-cookie']).toBeDefined();

        // Assuming you set two cookies: accessToken and refreshToken
        const cookies = response.headers['set-cookie'];

        // Extract cookie values (you may need to adjust this based on actual cookie names)
        const accessTokenCookie = cookies.find(cookie => cookie.includes('accessToken'));

        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBeDefined();
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });

  it('validate that cookies are deleted', () => {
    return request(app)
      .get('/clearCookies') // Specify the POST method
      .send({}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Cookies Cleared Successfully') // Check for expected status code
        // Check that cookies are set in the response
        expect(response.headers['set-cookie']).toBeDefined();

        // Assuming you set two cookies: accessToken and refreshToken
        const cookies = response.headers['set-cookie'];

        // Extract cookie values (you may need to adjust this based on actual cookie names)
        const accessTokenCookie = cookies.find(cookie => cookie.includes('accessToken'));
        const refreshTokenCookie = cookies.find(cookie => cookie.includes('refreshToken'));

        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBe("accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
        expect(refreshTokenCookie).toBe("refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });

  it("Delete token: responds with valid status", ()=> {
    return request(app)
      .delete('/delete_token/1')
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe("Token Deleted Successfully") // Check for expected status code
      })
  });

});