const { expect } = require('expect');
const request = require('supertest');


const isJenkins = process.env.JENKINS === 'true';


let app;

if (isJenkins){
  app  = "http://localhost:3000"
} else{
  app = require('../src/app.js');
}

let accessTokenCookie;
let refreshTokenCookie;

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
  it('validate that tokens are stored', () => {
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
        accessTokenCookie = cookies.find(cookie => cookie.includes('accessToken'));
        refreshTokenCookie = cookies.find(cookie => cookie.includes('refreshToken'));
        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toBeDefined();
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Valid JWT: responds with valid status code',() =>{
    return request(app)
      .get("/")
      .set('Authorization', `Bearer ${accessTokenCookie}, Bearer ${refreshTokenCookie}`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('JWT token is valid')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('validate that accessCookie is deleted', () => {
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

        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBe("accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('Invalid JWT: responds with invalid status code',() =>{
    return request(app)
      .get("/")
      .set('Authorization', `Bearer xxxx, Bearer yyyy`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Invalid JWT')
      })
      .catch((err)=>{
        return done(err)
      })
  })
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